"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { 
    ArrowDownToLine, 
    ArrowUpFromLine, 
    X, 
    ExternalLink, 
    ArrowRight, 
    Sparkles, 
    AlertCircle,
    Clock,
    Shield,
    Zap,
    ChevronDown,
    Check,
    Loader2
} from "lucide-react";
import { getSuperBridgeUrl, estimateBridgeTime, RELAY_CHAINS } from "@/lib/relay-bridge";
import { LISK_MAINNET_CHAIN_ID } from "@/config/chains";

// Transak configuration - Alternative: Use Onramper (aggregator, self-serve)
// Onramper: https://onramper.com - aggregates Transak, MoonPay, etc.
// No sales team needed, instant API key

const TRANSAK_API_KEY = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "";
const TRANSAK_ENV = process.env.NEXT_PUBLIC_TRANSAK_ENV || "STAGING";

// Onramper (alternative - aggregator, self-serve signup at onramper.com)
const ONRAMPER_API_KEY = process.env.NEXT_PUBLIC_ONRAMPER_API_KEY || "";

// Supported fiat currencies with Transak coverage info
const FIAT_CURRENCIES = {
    PHP: { name: "Philippine Peso", flag: "/flags/ph.svg", transakSupported: true },
    MYR: { name: "Malaysian Ringgit", flag: "/flags/my.svg", transakSupported: true },
    VND: { name: "Vietnamese Dong", flag: "/flags/vn.svg", transakSupported: true },
    IDR: { name: "Indonesian Rupiah", flag: "/flags/id.svg", transakSupported: false },
    THB: { name: "Thai Baht", flag: "/flags/th.svg", transakSupported: false },
    SGD: { name: "Singapore Dollar", flag: "/flags/sg.svg", transakSupported: false },
} as const;

type FiatCurrency = keyof typeof FIAT_CURRENCIES;

interface OnOffRampModalProps {
    mode: "onramp" | "offramp";
    onClose: () => void;
}

export function OnOffRampModal({ mode, onClose }: OnOffRampModalProps) {
    const { address } = useAccount();
    const chainId = useChainId();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrency>("PHP");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const currencyInfo = FIAT_CURRENCIES[selectedCurrency];
    const isTransakSupported = currencyInfo.transakSupported;
    const isMainnet = chainId === LISK_MAINNET_CHAIN_ID;

    // Build Transak URL
    const buildTransakUrl = () => {
        // Option 1: Onramper (aggregator - self-serve, no sales team)
        if (ONRAMPER_API_KEY) {
            const params = new URLSearchParams({
                apiKey: ONRAMPER_API_KEY,
                defaultCrypto: "USDC_BASE",
                defaultFiat: selectedCurrency,
                walletAddress: address || "",
                mode: mode === "onramp" ? "buy" : "sell",
            });
            return `https://buy.onramper.com?${params.toString()}`;
        }

        // Option 2: Transak
        const baseUrl = TRANSAK_ENV === "PRODUCTION" 
            ? "https://global.transak.com" 
            : "https://global-stg.transak.com";

        const params = new URLSearchParams({
            apiKey: TRANSAK_API_KEY,
            environment: TRANSAK_ENV,
            cryptoCurrencyCode: "USDC",
            network: "base", // Buy on Base, then bridge to Lisk
            defaultCryptoCurrency: "USDC",
            walletAddress: address || "",
            disableWalletAddressForm: address ? "true" : "false",
            themeColor: "3b82f6",
            hideMenu: "true",
            productsAvailed: mode === "onramp" ? "BUY" : "SELL",
            defaultFiatCurrency: selectedCurrency,
            fiatCurrency: Object.entries(FIAT_CURRENCIES)
                .filter(([_, v]) => v.transakSupported)
                .map(([k]) => k)
                .join(","),
        });

        if (amount) {
            params.set(mode === "onramp" ? "defaultFiatAmount" : "defaultCryptoAmount", amount);
        }

        return `${baseUrl}?${params.toString()}`;
    };

    const bridgeTime = estimateBridgeTime(RELAY_CHAINS.BASE, RELAY_CHAINS.LISK);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-slate-950 rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            mode === "onramp" 
                                ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20" 
                                : "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20"
                        }`}>
                            {mode === "onramp" ? (
                                <ArrowDownToLine className="w-6 h-6 text-white" />
                            ) : (
                                <ArrowUpFromLine className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {mode === "onramp" ? "Buy USDC" : "Cash Out"}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {mode === "onramp" ? "Fiat → Base → Lisk" : "Lisk → Base → Fiat"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800/60 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-900/30">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                    step >= s 
                                        ? "bg-blue-500 text-white" 
                                        : "bg-slate-800 text-slate-500"
                                }`}>
                                    {step > s ? <Check className="w-4 h-4" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-16 sm:w-24 h-0.5 mx-2 transition-all ${
                                        step > s ? "bg-blue-500" : "bg-slate-800"
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Select Currency</span>
                        <span>{mode === "onramp" ? "Buy on Base" : "Sell on Base"}</span>
                        <span>Bridge</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-5">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                                    Your Currency
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(FIAT_CURRENCIES).map(([code, info]) => (
                                        <button
                                            key={code}
                                            onClick={() => setSelectedCurrency(code as FiatCurrency)}
                                            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${
                                                selectedCurrency === code
                                                    ? "bg-white text-black shadow-lg"
                                                    : "bg-slate-900/50 text-slate-400 border border-slate-800 hover:border-slate-600"
                                            }`}
                                        >
                                            <img src={info.flag} alt={info.name} className="w-6 h-6 rounded-full" />
                                            <div className="text-left">
                                                <div className="font-semibold">{code}</div>
                                                {!info.transakSupported && (
                                                    <div className="text-[10px] text-orange-400">Manual bridge</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!isTransakSupported && (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-orange-200 font-medium">Limited Support</p>
                                            <p className="text-xs text-orange-300/70 mt-1">
                                                {selectedCurrency} is not directly supported. You'll need to use a local exchange first, then bridge.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setStep(2)}
                                disabled={!isTransakSupported}
                                className="w-full bg-white hover:bg-slate-100 text-black font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>

                            {!isTransakSupported && (
                                <a
                                    href={getSuperBridgeUrl({ fromChain: "base", toChain: "lisk" })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all text-center text-sm"
                                >
                                    Use Superbridge Instead <ExternalLink className="w-3 h-3 inline ml-1" />
                                </a>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            {/* Info cards */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                                    <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                                    <div className="text-xs text-slate-400">Instant</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                                    <Shield className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                    <div className="text-xs text-slate-400">Secure</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                                    <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                    <div className="text-xs text-slate-400">~5 min</div>
                                </div>
                            </div>

                            {/* Transak iframe */}
                            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                                <iframe
                                    src={buildTransakUrl()}
                                    className="w-full h-[400px]"
                                    allow="camera;microphone;payment"
                                    title={mode === "onramp" ? "Buy Crypto" : "Sell Crypto"}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Next: Bridge <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">
                                            {mode === "onramp" ? "Bridge to Lisk" : "Bridge from Lisk"}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {mode === "onramp" 
                                                ? "Move your USDC from Base to Lisk" 
                                                : "Move your USDC from Lisk to Base first"
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Estimated time</span>
                                        <span className="text-white font-medium">
                                            {mode === "onramp" ? "~5 minutes" : "~7 days (OP Stack)"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Bridge fee</span>
                                        <span className="text-white font-medium">~$0.50 gas</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Network</span>
                                        <span className="text-white font-medium">
                                            {mode === "onramp" ? "Base → Lisk" : "Lisk → Base"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={getSuperBridgeUrl({ 
                                    fromChain: mode === "onramp" ? "base" : "ethereum", 
                                    toChain: "lisk",
                                    token: "USDC"
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-4 rounded-xl transition-all text-center shadow-lg shadow-blue-500/20"
                            >
                                Open Superbridge <ExternalLink className="w-4 h-4 inline ml-2" />
                            </a>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all text-sm"
                            >
                                ← Back to {mode === "onramp" ? "Buy" : "Sell"}
                            </button>

                            <p className="text-xs text-slate-600 text-center">
                                Superbridge uses the official OP Stack bridge for maximum security
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Quick action cards for homepage
export function OnOffRampCards({ className = "" }: { className?: string }) {
    const { isConnected } = useAccount();
    const [showModal, setShowModal] = useState<"onramp" | "offramp" | null>(null);

    if (!isConnected) return null;

    return (
        <>
            <div className={`grid grid-cols-2 gap-4 ${className}`}>
                {/* On-Ramp Card - Links to dedicated page */}
                <a
                    href="/onramp"
                    className="group relative overflow-hidden bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-green-500/40 rounded-2xl p-5 transition-all duration-300 text-left"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-colors" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                            <ArrowDownToLine className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-semibold text-white text-lg mb-1">Buy & Convert</div>
                        <div className="text-sm text-slate-500 mb-3">Fiat → USDC → Local</div>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <Zap className="w-3 h-3" />
                            <span>One-click on-ramp</span>
                        </div>
                    </div>
                </a>

                {/* Off-Ramp Card */}
                <button
                    onClick={() => setShowModal("offramp")}
                    className="group relative overflow-hidden bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 transition-all duration-300 text-left"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            <ArrowUpFromLine className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-semibold text-white text-lg mb-1">Cash Out</div>
                        <div className="text-sm text-slate-500 mb-3">Withdraw to bank</div>
                        <div className="flex items-center gap-2 text-xs text-orange-400">
                            <Shield className="w-3 h-3" />
                            <span>Secure withdrawal</span>
                        </div>
                    </div>
                </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600">
                <Sparkles className="w-3 h-3" />
                <span>PHP, MYR, VND supported • Bridge via Superbridge</span>
            </div>

            {showModal && (
                <OnOffRampModal mode={showModal} onClose={() => setShowModal(null)} />
            )}
        </>
    );
}
