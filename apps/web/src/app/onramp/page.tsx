"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { 
  ArrowRight, 
  ArrowDown,
  Coins, 
  Zap, 
  Clock, 
  Shield,
  DollarSign,
  TrendingDown,
  ExternalLink,
  Check,
  ChevronDown,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { generateOneClickOnrampFlow, calculateValueProposition, OneClickOnrampQuote } from "@/lib/one-click-onramp";
import { CurrencyCode } from "@/config/currencies";

const FIAT_OPTIONS = [
  { code: "PHP", name: "Philippine Peso", flag: "/flags/ph.svg", supported: true },
  { code: "MYR", name: "Malaysian Ringgit", flag: "/flags/my.svg", supported: true },
  { code: "VND", name: "Vietnamese Dong", flag: "/flags/vn.svg", supported: true },
  { code: "USD", name: "US Dollar", flag: "/flags/us.svg", supported: true },
] as const;

const TARGET_OPTIONS = [
  { code: "IDR" as CurrencyCode, name: "Indonesian Rupiah", flag: "/flags/id.svg", stablecoin: "IDRX" },
  { code: "PHP" as CurrencyCode, name: "Philippine Peso", flag: "/flags/ph.svg", stablecoin: "Coming Soon" },
  { code: "VND" as CurrencyCode, name: "Vietnamese Dong", flag: "/flags/vn.svg", stablecoin: "Coming Soon" },
];

export default function OnrampPage() {
  const { isConnected, address } = useAccount();
  const [fiatCurrency, setFiatCurrency] = useState<"PHP" | "MYR" | "VND" | "USD">("PHP");
  const [fiatAmount, setFiatAmount] = useState("");
  const [targetCurrency, setTargetCurrency] = useState<CurrencyCode>("IDR");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [quote, setQuote] = useState<OneClickOnrampQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Auto-fill recipient with connected wallet
  useEffect(() => {
    if (address && !recipientAddress) {
      setRecipientAddress(address);
    }
  }, [address, recipientAddress]);

  // Calculate value proposition
  const valueProps = fiatAmount 
    ? calculateValueProposition({ amount: parseFloat(fiatAmount), currency: targetCurrency })
    : null;

  const handleGetQuote = async () => {
    if (!fiatAmount || !recipientAddress || !address) return;

    setIsLoading(true);
    try {
      const result = await generateOneClickOnrampFlow({
        fiatCurrency,
        fiatAmount: parseFloat(fiatAmount),
        targetCurrency,
        recipientAddress,
        userAddress: address,
      });
      setQuote(result);
      setStep(2);
    } catch (error) {
      console.error("Failed to get quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black relative font-sans">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 sm:py-10 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xl">SEAbucks</span>
              <span className="text-[10px] text-green-400 font-medium uppercase">One-Click On-Ramp</span>
            </div>
          </Link>
          <ConnectWallet />
        </header>

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Fiat to SEA Currency
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400"> in One Click</span>
          </h1>
          <p className="text-slate-400">
            Buy with card/bank → Auto-bridge → Receive local stablecoin
          </p>
        </div>

        {/* Value Proposition Banner */}
        {valueProps && parseFloat(fiatAmount) > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">
                    Save ${valueProps.savings.fee.toFixed(2)} vs traditional
                  </div>
                  <div className="text-xs text-slate-400">
                    {valueProps.seabucks.time} instead of {valueProps.traditional.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  {valueProps.seabucks.steps} steps
                </div>
                <div className="text-xs text-slate-500">vs {valueProps.traditional.steps} traditional</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s ? "bg-green-500 text-white" : "bg-slate-800 text-slate-500"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 mx-1 ${step > s ? "bg-green-500" : "bg-slate-800"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              {/* From Section */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  You Pay
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={fiatAmount}
                      onChange={(e) => setFiatAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 text-2xl font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={fiatCurrency}
                      onChange={(e) => setFiatCurrency(e.target.value as any)}
                      className="appearance-none bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 pr-10 text-white font-medium focus:outline-none focus:border-green-500 cursor-pointer"
                    >
                      {FIAT_OPTIONS.filter(f => f.supported).map((f) => (
                        <option key={f.code} value={f.code}>{f.code}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                  <ArrowDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* To Section */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Recipient Gets
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {TARGET_OPTIONS.map((t) => (
                    <button
                      key={t.code}
                      onClick={() => setTargetCurrency(t.code)}
                      disabled={t.stablecoin === "Coming Soon"}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        targetCurrency === t.code
                          ? "bg-green-500/10 border-green-500/50 text-white"
                          : t.stablecoin === "Coming Soon"
                            ? "bg-slate-900/30 border-slate-800/50 text-slate-600 cursor-not-allowed"
                            : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={t.flag} alt={t.name} className="w-8 h-8 rounded-full" />
                        <div className="text-left">
                          <div className="font-medium">{t.code}</div>
                          <div className="text-xs text-slate-500">{t.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          t.stablecoin === "Coming Soon" 
                            ? "bg-slate-800 text-slate-500" 
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {t.stablecoin}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Recipient Wallet
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-slate-700 focus:outline-none focus:border-green-500"
                />
                {address && recipientAddress !== address && (
                  <button 
                    onClick={() => setRecipientAddress(address)}
                    className="text-xs text-blue-400 mt-2 hover:underline"
                  >
                    Use my wallet ({address.slice(0, 6)}...{address.slice(-4)})
                  </button>
                )}
              </div>

              {/* CTA */}
              {!isConnected ? (
                <div className="flex justify-center pt-4">
                  <ConnectWallet />
                </div>
              ) : (
                <button
                  onClick={handleGetQuote}
                  disabled={!fiatAmount || !recipientAddress || isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Quote...
                    </>
                  ) : (
                    <>
                      Get Quote <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {step === 2 && quote && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold text-white text-center">Your Quote</h3>

              {/* Summary */}
              <div className="bg-slate-900/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">You Pay</span>
                  <span className="text-white font-bold text-xl">{fiatAmount} {fiatCurrency}</span>
                </div>
                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <span className="text-slate-400">Recipient Gets</span>
                  <span className="text-green-400 font-bold text-xl">~{quote.estimatedOutput} {quote.outputCurrency}</span>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-slate-900/30 rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Fee Breakdown</div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transak (Card/Bank)</span>
                  <span className="text-slate-300">{quote.fees.transakFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Bridge ({quote.bridgeMethod})</span>
                  <span className="text-slate-300">{quote.fees.bridgeFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">FX Conversion</span>
                  <span className="text-slate-300">{quote.fees.swapFee}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-medium">
                  <span className="text-white">Total Fees</span>
                  <span className="text-white">{quote.fees.totalFeePercent}</span>
                </div>
              </div>

              {/* Time Estimate */}
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Estimated time: {quote.estimatedTime}</span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <a
                  href={quote.transakUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white hover:bg-slate-100 text-black font-bold text-lg py-4 rounded-xl transition-all text-center shadow-lg"
                >
                  Start Purchase <ExternalLink className="w-4 h-4 inline ml-2" />
                </a>
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all"
                >
                  ← Modify
                </button>
              </div>

              {/* Next Steps Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-200 font-medium">After Purchase</p>
                    <p className="text-xs text-blue-300/70 mt-1">
                      Once you receive USDC on Base, use Superbridge to move it to Lisk. 
                      Then the recipient can use SEAbucks to convert to {quote.outputCurrency}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">How It Works</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm font-medium text-white">1. Buy USDC</div>
              <div className="text-xs text-slate-500 mt-1">Card or bank via Transak</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm font-medium text-white">2. Bridge</div>
              <div className="text-xs text-slate-500 mt-1">Base → Lisk via Superbridge</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-sm font-medium text-white">3. Convert</div>
              <div className="text-xs text-slate-500 mt-1">USDC → Local currency</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
