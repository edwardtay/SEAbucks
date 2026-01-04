"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PaymentPortalABI } from "@/abis/PaymentPortalABI";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight, ArrowRightLeft } from "lucide-react";

// Replace with deployed addresses
const PAYMENT_PORTAL_ADDRESS = "0xd2b24B1a5345C17c0BCC022Ac0b2123353bd2122";
const USDC_ADDRESS = "0xDb993d5dc583017b7624F650deBc8B140213C490";

function PaymentContent() {
    const searchParams = useSearchParams();
    const to = searchParams.get("to");
    const amount = searchParams.get("amount");
    const memo = searchParams.get("memo");
    const currency = searchParams.get("currency") || USDC_ADDRESS; // Default to USDC
    const symbol = searchParams.get("symbol") || "USDC";

    const { isConnected, address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    const [status, setStatus] = useState<"idle" | "approving" | "paying" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState("");

    const amountBigInt = amount ? parseUnits(amount, 18) : 0n;

    // Check allowance for USDC (Payer always pays in USDC)
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, PAYMENT_PORTAL_ADDRESS],
        query: {
            enabled: !!address && isConnected,
        }
    });

    const handlePay = async () => {
        if (!isConnected || !to || !amount) return;

        try {
            setStatus("paying"); // assumed approved or handled

            // Determine if swap is needed
            // Pay(tokenIn, tokenOut, to, amountIn, amountOutMin, memo)

            // For Mock Logic: amountOutMin = amountBigInt (1:1 Swap)
            const minOut = amountBigInt;

            const hash = await writeContractAsync({
                address: PAYMENT_PORTAL_ADDRESS,
                abi: PaymentPortalABI,
                functionName: "pay",
                args: [
                    USDC_ADDRESS,           // tokenIn
                    currency as `0x${string}`, // tokenOut (Desired)
                    to as `0x${string}`,    // Merchant
                    amountBigInt,           // Amount In
                    minOut,                 // Min Out (1:1 for mock)
                    memo || ""              // Memo
                ],
            });

            setTxHash(hash);
            setStatus("success");
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
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: "approve",
                args: [PAYMENT_PORTAL_ADDRESS, amountBigInt],
            });
            setTimeout(() => refetchAllowance(), 2000);
            setStatus("idle");
        } catch (e) {
            setStatus("error");
        }
    }

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
    const isSwapping = currency.toLowerCase() !== USDC_ADDRESS.toLowerCase();

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
                            {amount} <span className="text-2xl text-slate-600">USDC</span>
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
                            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-black">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-white">Paid Successfully</h3>
                                <a
                                    href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-slate-400 hover:text-white text-sm transition-colors gap-1 border-b border-transparent hover:border-white pb-0.5"
                                >
                                    View Receipt <ArrowRight size={12} />
                                </a>
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
                                                {status === "approving" ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Approving...</span> : "Approve USDC"}
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
