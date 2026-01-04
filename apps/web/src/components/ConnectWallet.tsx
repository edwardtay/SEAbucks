"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWallet() {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button onClick={openConnectModal} className="bg-white text-black font-medium py-2 px-4 rounded-full text-sm hover:bg-slate-200 transition-colors">
                                        Connect Wallet
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button onClick={openChainModal} className="bg-red-500 text-white font-medium py-2 px-4 rounded-full text-sm hover:bg-red-600 transition-colors">
                                        Wrong network
                                    </button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="bg-slate-800 text-white font-medium py-2 px-4 rounded-full text-sm border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        {account.displayName}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
