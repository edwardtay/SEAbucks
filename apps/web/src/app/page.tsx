"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Copy, Plus, QrCode, Share2, Coins, ArrowRightLeft, ArrowRight, Check, History, TrendingUp } from "lucide-react";
import { CURRENCIES, CurrencyCode } from "@/config/currencies";
import { TOKENS, TokenCode } from "@/config/tokens";
import { getChainConfig, LISK_SEPOLIA_CHAIN_ID, SupportedChainId } from "@/config/chains";

import Link from "next/link";

export default function Home() {
  const { isConnected, address, chain } = useAccount();
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("IDR"); // Default to IDR (Destination)
  const [token, setToken] = useState<TokenCode>("USDC"); // Default Source Token
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [rate, setRate] = useState<number | null>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  // Mock fetching recent payments (In production, use TheGraph or an Indexer)
  useEffect(() => {
    if (isConnected) {
      // Simulate some data for the demo "Merchant Dashboard" feel
      setRecentPayments([
        { id: 1, amount: "500,000", currency: "IDR", from: "0x12..ab12", time: "2 mins ago" },
        { id: 2, amount: "1,200", currency: "THB", from: "0x89..cd34", time: "15 mins ago" },
        { id: 3, amount: "450,000", currency: "VND", from: "0x56..ef56", time: "1 hour ago" },
      ]);
    }
  }, [isConnected]);

  const chainId = (chain?.id || LISK_SEPOLIA_CHAIN_ID) as SupportedChainId;
  const TOKENS_CONFIG = getChainConfig(TOKENS, chainId);
  const CURRENCIES_CONFIG = getChainConfig(CURRENCIES, chainId);

  useEffect(() => {
    // Fetch live rate
    const fetchRate = async () => {
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
        const data = await res.json();
        if (data && data.rates && data.rates[currency]) {
          setRate(data.rates[currency]);
        }
      } catch (e) {
        console.error("Failed to fetch rate");
      }
    };
    fetchRate();
  }, [currency]);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const params = new URLSearchParams();
    params.set("to", address);
    params.set("amount", amount);
    if (memo) params.set("memo", memo);
    params.set("currency", CURRENCIES_CONFIG[currency].address);
    params.set("symbol", currency);
    params.set("token", token); // Add source token code

    const url = `${window.location.origin}/pay?${params.toString()}`;
    setGeneratedLink(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/20 font-sans overflow-x-hidden">
      {/* Background Ambience */}
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
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Powered by Lisk</span>
            </div>
          </Link>
          <ConnectWallet />
        </header>

        {!isConnected ? (
          <div className="text-center py-12 sm:py-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Fast, Secure Payments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">for Southeast Asia.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
              Accept USDC from anywhere. <br className="hidden sm:block" />
              Auto-swapped to your local SEA currency instantly.
            </p>

            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto pt-8">
              {(Object.keys(CURRENCIES_CONFIG) as CurrencyCode[]).map(c => (
                <div key={c} className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full pl-2 pr-4 py-1.5 transition-all hover:bg-slate-800/80 hover:border-slate-700 hover:scale-105 cursor-default">
                  <img src={CURRENCIES_CONFIG[c].flag} alt={CURRENCIES_CONFIG[c].name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-xs font-medium text-slate-300">{c}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Creation Card */}
            <div className="glass-card rounded-3xl p-1">
              <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-6 sm:p-10 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-6">Create Request</h2>

                <form onSubmit={handleCreateLink} className="space-y-6">
                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div className="group relative">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</label>
                        {/* Token Selector */}
                        <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-800">
                          {(Object.keys(TOKENS_CONFIG) as TokenCode[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setToken(t)}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${token === t ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                                }`}
                            >
                              <img src={TOKENS_CONFIG[t].logo} className="w-4 h-4 rounded-full" />
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-transparent border-b-2 border-slate-800 py-4 text-5xl sm:text-6xl font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
                          required
                          step="0.01"
                          min="0.01"
                        />
                      </div>
                    </div>

                    {/* Currency Selector */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Receive In</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(Object.keys(CURRENCIES_CONFIG) as CurrencyCode[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setCurrency(t)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${currency === t
                              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]"
                              : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60"
                              }`}
                          >
                            {CURRENCIES_CONFIG[t].flag && <img src={CURRENCIES_CONFIG[t].flag} alt={t} className="w-5 h-5 rounded-full object-cover shadow-sm" />}
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Memo Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Note (Optional)</label>
                      <input
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="What's this for?"
                        className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Rate Display */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-400">Live Rate</span>
                    </div>
                    <div className="text-sm font-mono text-slate-200">
                      1 {token} ≈ {rate ? rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "..."} {currency}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!amount}
                    className="w-full group relative overflow-hidden bg-white text-black font-bold text-lg py-4 rounded-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative flex items-center justify-center gap-2">
                      Generate Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Result Area */}
            {generatedLink && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-400">Payment Link Ready</span>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className={`p-2.5 rounded-lg transition-all duration-200 ${copied ? 'bg-green-500/20 text-green-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>

                    </div>
                  </div>
                  <div className="font-mono text-sm text-slate-300 break-all bg-black/40 p-4 rounded-xl border border-slate-800/50 select-all">
                    {generatedLink}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Merchant Dashboard / Recent Payments (Winning Feature) */}
      {isConnected && (
        <div className="max-w-2xl mx-auto px-6 pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <History size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Recent Incoming</span>
          </div>
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Received <span className="text-green-400">+{p.amount} {p.currency}</span></div>
                    <div className="text-[10px] text-slate-500 font-mono">from {p.from}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {p.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="fixed bottom-4 left-0 right-0 text-center pointer-events-none z-0 opacity-40">
        <p className="text-[10px] text-slate-600 font-medium">
          Beta. Use at your own risk.
        </p>
      </footer>
    </main>
  );
}
