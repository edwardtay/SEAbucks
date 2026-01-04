"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Copy, Plus, QrCode, Share2, Coins, ArrowRightLeft, ArrowRight } from "lucide-react";

// Mock Addresses (Replace with real)
const TOKENS = {
  USDC: "0xDb993d5dc583017b7624F650deBc8B140213C490", // MockUSDC
  IDR: "0xcfF09905F8f18B35F5A1Ba6d2822D62B3d8c48bE",
  THB: "0xf98a4A0482d534c004cdB9A3358fd71347c4395B",
  VND: "0xa7056B7d2d7B97dE9F254C17Ab7E0470E5F112c0",
  PHP: "0x073b61f5Ed26d802b05301e0E019f78Ac1A41D23",
  MYR: "0x8F878deCd44f7Cf547D559a6e6D0577E370fa0Db",
  SGD: "0xEff2eC240CEB2Ddf582Df0e42fc66a6910D3Fe3f"
};

export default function Home() {
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [currency, setCurrency] = useState<keyof typeof TOKENS>("USDC");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const params = new URLSearchParams();
    params.set("to", address);
    params.set("amount", amount);
    if (memo) params.set("memo", memo);
    params.set("currency", TOKENS[currency]);
    params.set("symbol", currency);

    const url = `${window.location.origin}/pay?${params.toString()}`;
    setGeneratedLink(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  return (
    <main className="min-h-screen bg-black text-slate-200 selection:bg-white/20 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Minimal Header */}
        <header className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Seabuck Logo" className="w-8 h-8" />
            <span className="font-semibold text-white tracking-tight text-lg">SEAbucks</span>
          </div>
          <ConnectWallet />
        </header>

        {!isConnected ? (
          <div className="text-center py-24 space-y-8">
            <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-4 animate-in fade-in zoom-in duration-700">
              <img src="/logo.svg" alt="Seabuck Logo" className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-medium tracking-tight text-white leading-[1.1]">
              The easiest way to <br />
              <span className="text-slate-500">get paid in SEA.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
              Merchants accept USDC, we auto-swap to your local currency instantly.
              Supports <strong>IDR, THB, VND, PHP, MYR, SGD</strong>.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-xl mx-auto opacity-50 pt-8">
              {["IDR", "THB", "VND", "PHP", "MYR", "SGD"].map(c => (
                <div key={c} className="border border-slate-800 rounded-lg py-2 text-xs font-mono text-slate-500">
                  {c}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Creation Card */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-white">New Request</h2>

              <form onSubmit={handleCreateLink} className="space-y-8">
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div className="group relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent border-b border-slate-800 py-4 text-5xl font-light text-white placeholder:text-slate-800 focus:outline-none focus:border-white transition-colors"
                      required
                      step="0.01"
                      min="0.01"
                    />
                    <span className="absolute right-0 top-6 text-sm font-medium text-slate-500">USDC</span>
                  </div>

                  {/* Currency Selector */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-600 mb-3">Receiving Currency</label>
                    <div className="flex gap-2">
                      {Object.keys(TOKENS).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCurrency(t as keyof typeof TOKENS)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${currency === t
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-600"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Memo Input */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-slate-600">Note</label>
                    <input
                      type="text"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="What is this for?"
                      className="w-full bg-transparent border-b border-slate-800 py-2 text-lg text-white placeholder:text-slate-800 focus:outline-none focus:border-slate-600 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!amount}
                  className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Generate Link <ArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Result Area */}
            {generatedLink && (
              <div className="pt-8 border-t border-slate-900 animate-in fade-in">
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">Payment Link</span>
                    <div className="flex gap-2">
                      <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-md text-slate-400 transition-colors">
                        <Copy size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-800 rounded-md text-slate-400 transition-colors">
                        <QrCode size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-500 break-all bg-black/20 p-3 rounded-lg">
                    {generatedLink}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
