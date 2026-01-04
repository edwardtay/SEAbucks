import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import { lisk } from 'viem/chains'

export const liskSepolia = defineChain({
    id: 4202,
    name: 'Lisk Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    },
    blockExplorers: {
        default: { name: 'Blockscout', url: 'https://sepolia-blockscout.lisk.com' },
    },
    testnet: true,
})

export const config = getDefaultConfig({
    appName: 'SEAbucks',
    projectId: 'YOUR_PROJECT_ID', // Replace with actual ID (WalletConnect)
    chains: [liskSepolia, lisk],
    ssr: true,
})
