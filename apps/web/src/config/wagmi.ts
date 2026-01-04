import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

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

export const config = createConfig({
    chains: [liskSepolia],
    connectors: [injected()],
    transports: {
        [liskSepolia.id]: http(),
    },
})
