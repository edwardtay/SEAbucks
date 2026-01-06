"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Copy, Coins, ArrowRightLeft, ArrowRight, Check, History, TrendingUp, RefreshCw, ExternalLink, Zap, QrCode } from "lucide-react";
import { CURRENCIES, CurrencyCode, hasCurrencyStablecoin } from "@/config/currencies";
import { TOKENS, TokenCode } from "@/config/tokens";
import { getChainConfig, LISK_SEPOLIA_CHAIN_ID, LISK_MAINNET_CHAIN_ID, SupportedChainId } from "@/config/chains";
import { OnOffRampCards } from "@/components/OnOffRamp";
import { PaymentQR } from "@/components/PaymentQR";
import { MerchantStats } from "@/components/MerchantStats";
import Link from "next/link";

interface RateData {
  rate: number;
  source: string;
  timestamp: number;
}

export default function Home() {
  const { isConnected, address, chain } = useAccount();
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("IDR");
  const [token, setToken] = useState<TokenCode>("USDC");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  const chainId = (chain?.id || LISK_SEPOLIA_CHAIN_ID) as SupportedChainId;
  const TOKENS_CONFIG = getChainConfig(TOKENS, chainId);
  const CURRENCIES_CONFIG = getChainConfig(CURRENCIES, chainId);
  const isMainnet = chainId === LISK_MAINNET_CHAIN_ID;

  // Fetch rate from our API
  const fetchRate = useCallback(async () => {
    setIsLoadingRate(true);
    try {
      const res = await fetch(`/api/rates?currency=${currency}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRateData(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch rate:", e);
    } finally {
      setIsLoadingRate(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchRate();
    // Refresh rate every 60 seconds
    const interval = setInterval(fetchRate, 60000);
    return () => clearInterval(interval);
  }, [fetchRate]);

  // Fetch recent payments from blockchain (real data)
  useEffect(() => {
    if (isConnected && address) {
      // For now, show empty state - real payments will appear after transactions
      // In production, this would fetch from TheGraph or Blockscout
      setRecentPayments([]);
      
      // Uncomment when router has real transactions:
      // fetchRecentPayments(chainId, address).then(setRecentPayments);
    }
  }, [isConnected, address, chainId]);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const currencyConfig = CURRENCIES_CONFIG[currency];
    const params = new URLSearchParams();
    params.set("to", address);
    params.set("amount", amount);
    if (memo) params.set("memo", memo);
    params.set("currency", currencyConfig.address);
    params.set("symbol", currency);
    params.set("token", token);
    params.set("chain", chainId.toString());

    const url = `${window.location.origin}/pay?${params.toString()}`;
    setGeneratedLink(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate estimated receive amount
  const estimatedReceive = amount && rateData 
    ? (parseFloat(amount) * rateData.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null;

  // Check if selected currency has real stablecoin
  const currencyHasStablecoin = hasCurrencyStablecoin(CURRENCIES_CONFIG[currency]);

  // Get block explorer URL
  const getExplorerUrl = (txHash: string) => {
    return isMainnet 
      ? `https://blockscout.lisk.com/tx/${txHash}`
      : `https://sepolia-blockscout.lisk.com/tx/${txHash}`;
  };

  return (
    <main className="min-h-screen bg-black relative selection:bg-blue-500/20 font-sans overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 sm:py-10 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 sm:mb-12">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Coins className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-xl tracking-tight leading-none">SEAbucks</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
                {isMainnet ? "Lisk Mainnet" : "Lisk Sepolia"}
              </span>
            </div>
          </Link>
          <ConnectWallet />
        </header>

        {/* Merchant Stats */}
        {isConnected && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-3 text-slate-400">
              <TrendingUp size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Your Dashboard</span>
            </div>
            <MerchantStats />
          </div>
        )}

        {/* On-Ramp / Off-Ramp */}
        {isConnected && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <ArrowRightLeft size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Fund Your Wallet</span>
            </div>
            <OnOffRampCards />
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-12 sm:py-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Cross-Border Payments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">for Southeast Asia.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
              Accept USDC from anywhere. <br className="hidden sm:block" />
              Settle in your local currency instantly.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">&lt;2s</div>
                <div className="text-xs text-slate-500">Settlement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0.5%</div>
                <div className="text-xs text-slate-500">Fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-xs text-slate-500">Currencies</div>
              </div>
            </div>

            {/* Currency badges */}
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto pt-8">
              {(Object.keys(CURRENCIES_CONFIG) as CurrencyCode[]).map(c => {
                const hasStablecoin = hasCurrencyStablecoin(CURRENCIES_CONFIG[c]);
                return (
                  <div 
                    key={c} 
                    className={`flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 transition-all hover:scale-105 cursor-default ${
                      hasStablecoin 
                        ? "bg-green-500/10 border border-green-500/30" 
                        : "bg-slate-900/50 border border-slate-800"
                    }`}
                  >
                    <img src={CURRENCIES_CONFIG[c].flag} alt={CURRENCIES_CONFIG[c].country} className="w-5 h-5 rounded-full object-cover" />
                    <span className={`text-xs font-medium ${hasStablecoin ? "text-green-400" : "text-slate-400"}`}>{c}</span>
                    {hasStablecoin && <Zap className="w-3 h-3 text-green-400" />}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600">
              <Zap className="w-3 h-3 inline text-green-400" /> = Real stablecoin deployed on Lisk
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Payment Request Card */}
            <div className="bg-slate-950/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">Create Payment Request</h2>

              <form onSubmit={handleCreateLink} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</label>
                    <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-800">
                      {(Object.keys(TOKENS_CONFIG) as TokenCode[]).filter(t => 
                        TOKENS_CONFIG[t].address !== "0x0000000000000000000000000000000000000000"
                      ).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setToken(t)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                            token === t ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <img src={TOKENS_CONFIG[t].logo} className="w-4 h-4 rounded-full" alt={t} />
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-b-2 border-slate-800 py-4 text-5xl font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                    required
                    step="0.01"
                    min="0.01"
                  />
                  {estimatedReceive && (
                    <div className="mt-2 text-sm text-slate-500">
                      ≈ {estimatedReceive} {currency}
                    </div>
                  )}
                </div>

                {/* Currency Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Settle In</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(Object.keys(CURRENCIES_CONFIG) as CurrencyCode[]).map((c) => {
                      const hasStablecoin = hasCurrencyStablecoin(CURRENCIES_CONFIG[c]);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          disabled={!hasStablecoin}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all border ${
                            currency === c
                              ? "bg-white text-black border-white shadow-lg scale-105"
                              : hasStablecoin
                                ? "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600"
                                : "bg-slate-900/20 text-slate-600 border-slate-800/50 cursor-not-allowed opacity-50"
                          }`}
                        >
                          <img src={CURRENCIES_CONFIG[c].flag} alt={c} className="w-6 h-6 rounded-full" />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!currencyHasStablecoin && (
                    <p className="mt-2 text-xs text-orange-400">
                      {currency} stablecoin not yet deployed. Only IDR (IDRX) is available.
                    </p>
                  )}
                </div>

                {/* Memo */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Note (Optional)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Invoice #123, Order reference..."
                    className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Live Rate */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isLoadingRate ? "bg-yellow-500" : "bg-green-500"} animate-pulse`} />
                      <span className="text-xs font-medium text-slate-400">
                        {rateData?.source || "Loading..."}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={fetchRate}
                      className="p-1 hover:bg-slate-800 rounded transition-colors"
                      disabled={isLoadingRate}
                    >
                      <RefreshCw className={`w-3 h-3 text-slate-500 ${isLoadingRate ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                  <div className="mt-2 text-lg font-mono text-white">
                    1 {token} = {rateData?.rate?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "..."} {currency}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!amount || !currencyHasStablecoin}
                  className="w-full bg-white hover:bg-slate-100 text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                >
                  Generate Payment Link <ArrowRight size={20} />
                </button>
              </form>
            </div>

            {/* Generated Link with QR */}
            {generatedLink && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                {/* QR Code Card */}
                <div className="rounded-2xl overflow-hidden">
                  <PaymentQR
                    paymentUrl={generatedLink}
                    amount={amount}
                    currency={token}
                    memo={memo}
                  />
                </div>

                {/* Link Display */}
                <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Payment Link</span>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                        copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-400 break-all select-all">
                    {generatedLink}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Payments */}
      {isConnected && (
        <div className="max-w-2xl mx-auto px-6 pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <History size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Recent Payments</span>
            </div>
            <a 
              href={isMainnet ? "https://blockscout.lisk.com" : "https://sepolia-blockscout.lisk.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              View on Blockscout <ExternalLink size={10} />
            </a>
          </div>
          
          {recentPayments.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-slate-500 text-sm mb-2">No payments yet</div>
              <div className="text-slate-600 text-xs">
                Payments will appear here after your first transaction
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp size={16} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        +{p.amount} <span className="text-green-400">{p.currency}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">from {p.from}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-600">{p.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Status */}
          <div className="mt-8 bg-slate-900/30 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">System Status</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">FX Rates</span>
                <span className="text-green-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Addresses</span>
                <span className="text-green-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Official Lisk
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Router Contract</span>
                <span className={`flex items-center gap-1 ${isMainnet ? "text-orange-400" : "text-green-400"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isMainnet ? "bg-orange-400" : "bg-green-400"}`} />
                  {isMainnet ? "Not Deployed" : "Sepolia"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">IDRX Liquidity</span>
                <span className="text-orange-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Needs Funding
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-4 left-0 right-0 text-center pointer-events-none z-0">
        <p className="text-[10px] text-slate-600">
          {isMainnet ? "Production" : "Testnet"} • Built on Lisk
        </p>
      </footer>
    </main>
  );
}
