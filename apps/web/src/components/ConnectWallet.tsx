"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, LogOut } from "lucide-react";

export function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected) {
        return (
            <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 flex items-center gap-2">
                    <Wallet size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium text-slate-200">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                </div>
                <button
                    onClick={() => disconnect()}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    title="Disconnect"
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: injected() })}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
        >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
        </button>
    );
}
