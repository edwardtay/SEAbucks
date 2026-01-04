"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { TOKENS, TokenCode } from "@/config/tokens";
import { getChainConfig, LISK_SEPOLIA_CHAIN_ID, SupportedChainId } from "@/config/chains";
import { SEABucksRouterABI } from "@/abis/SEABucksRouterABI";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, ArrowRightLeft, Download, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";
import { useRef } from "react";

// Helper to get Router Address based on chain
const getRouterAddress = (chainId: number) => {
    // For Hackathon, we might have same address or different.
    // Lisk Sepolia
    if (chainId === LISK_SEPOLIA_CHAIN_ID) return "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    // Mainnet Placeholder
    return "0x...";
};

function PaymentContent() {
    const searchParams = useSearchParams();
    const to = searchParams.get("to");
    const amount = searchParams.get("amount");
    const memo = searchParams.get("memo");
    const currency = searchParams.get("currency"); // Destination Token Address (e.g. IDR)
    const symbol = searchParams.get("symbol") || "IDR";
    const tokenParam = (searchParams.get("token") as TokenCode) || "USDC";

    const { isConnected, address, chain } = useAccount();
    const chainId = (chain?.id || LISK_SEPOLIA_CHAIN_ID) as SupportedChainId;

    const TOKENS_CONFIG = getChainConfig(TOKENS, chainId);
    const sourceToken = TOKENS_CONFIG[tokenParam] || TOKENS_CONFIG.USDC;

    const tokenInAddress = sourceToken.address;
    const tokenSymbol = sourceToken.symbol;
    const routerAddress = getRouterAddress(chainId);

    const { writeContractAsync } = useWriteContract();
    const receiptRef = useRef<HTMLDivElement>(null);

    const [status, setStatus] = useState<"idle" | "approving" | "paying" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");

    const amountBigInt = amount ? parseUnits(amount, sourceToken.decimals) : 0n;

    // Check allowance for Source Token
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenInAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, routerAddress as `0x${string}`],
        query: {
            enabled: !!address && isConnected,
        }
    });

    const handlePay = async () => {
        if (!isConnected || !to || !amount || !currency) return;

        try {
            setStatus("paying");

            // 1. Get Quote & Signature from Dealer (Server)
            const quoteRes = await fetch("/api/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tokenIn: tokenInAddress,
                    tokenOut: currency,
                    amountIn: amountBigInt.toString(),
                    recipient: to,
                })
            });

            const quoteData = await quoteRes.json();
            if (!quoteRes.ok) throw new Error(quoteData.error || "Failed to get quote");

            const { signature, amountOut, deadline, rate } = quoteData;
            console.log("Got Quote:", quoteData);

            // 2. Execute Swap via Router
            const hash = await writeContractAsync({
                address: routerAddress as `0x${string}`,
                abi: SEABucksRouterABI,
                functionName: "swapExactTokensForTokensWithSignature",
                args: [
                    tokenInAddress as `0x${string}`,
                    currency as `0x${string}`,
                    amountBigInt,
                    BigInt(amountOut),
                    to as `0x${string}`,
                    BigInt(deadline),
                    signature as `0x${string}`
                ],
            });

            setTxHash(hash);
            setStatus("success");
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#9333ea', '#22c55e', '#ffffff']
            });
        } catch (e: any) {
            console.error(e);
            setErrorMessage(e.message || "Payment failed");
            setStatus("error");
        }
    };

    const needsApproval = (allowance || 0n) < amountBigInt;

    const handleApprove = async () => {
        try {
            setStatus("approving");
            await writeContractAsync({
                address: tokenInAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: "approve",
                args: [routerAddress as `0x${string}`, amountBigInt],
            });
            setTimeout(() => refetchAllowance(), 2000);
            setStatus("idle");
        } catch (e) {
            setStatus("error");
        }
    }

    const downloadReceipt = async () => {
        if (receiptRef.current === null) return;

        try {
            const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#020617' });
            const link = document.createElement('a');
            link.download = `seabucks-receipt-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
        }
    };


    if (!to || !amount) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 font-sans">
                <div className="text-center">
                    <p className="text-lg mb-2">Invalid Link</p>
                    <p className="text-sm">Please ask the merchant for a new link.</p>
                </div>
            </div>
        );
    }

    // Check if swapping
    const isSwapping = currency?.toLowerCase() !== tokenInAddress.toLowerCase();

    return (
        <div className="min-h-screen bg-black text-slate-200 flex items-center justify-center p-6 font-sans selection:bg-white/20">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full mb-4">
                        <span className="text-black font-bold text-sm">S</span>
                    </div>
                    <h1 className="text-xl font-medium text-white">Payment Request</h1>
                    <div className="text-sm text-slate-500 font-mono" title={to}>
                        to {to.slice(0, 6)}...{to.slice(-4)}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="text-center py-10 border-y border-slate-900">
                        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Total Due</div>
                        <div className="text-5xl font-light text-white tracking-tight">
                            {amount} <span className="text-2xl text-slate-600">{tokenSymbol}</span>
                        </div>

                        {isSwapping && (
                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 text-xs border border-slate-800">
                                <ArrowRightLeft size={10} />
                                <span>Merchant receives <strong>{symbol}</strong></span>
                            </div>
                        )}
                    </div>

                    {memo && (
                        <div className="text-center px-4">
                            <span className="text-sm text-slate-400 italic">"{memo}"</span>
                        </div>
                    )}

                    <div className="pt-4">
                        {status === "success" ? (
                            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div ref={receiptRef} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Payment Successful!</h3>
                                        <p className="text-slate-400 text-sm">You paid <span className="text-white font-medium">{amount} {tokenSymbol}</span></p>
                                    </div>
                                    <div className="border-t border-slate-800 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Recipient</span>
                                            <span className="text-slate-300 font-mono">{to.slice(0, 6)}...{to.slice(-4)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Method</span>
                                            <span className="text-slate-300">SEAbucks on Lisk</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Date</span>
                                            <span className="text-slate-300">{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Verified Transaction</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={downloadReceipt}
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <Download size={14} /> Save Receipt
                                    </button>
                                    <a
                                        href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <Share2 size={14} /> View On-Chain
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!isConnected ? (
                                    <div className="flex justify-center">
                                        <ConnectWallet />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {status === "error" && (
                                            <div className="text-center text-red-500 text-sm mb-4">
                                                {errorMessage || "Transaction failed. Please try again."}
                                            </div>
                                        )}

                                        {needsApproval ? (
                                            <button
                                                onClick={handleApprove}
                                                disabled={status === "approving"}
                                                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                                            >
                                                {status === "approving" ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Approving...</span> : `Approve ${tokenSymbol}`}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handlePay}
                                                disabled={status === "paying"}
                                                className="w-full py-3.5 bg-white hover:bg-slate-200 text-black rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 text-sm"
                                            >
                                                {status === "paying" ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Processing...</span> : "Pay Now"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-slate-700">Secured by Seabuck on Lisk</p>
                </div>
            </div>
        </div>
    );
}

export default function PayPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-slate-500">Loading...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
