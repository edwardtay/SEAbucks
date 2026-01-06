// Relay.link Bridge Integration for instant cross-chain transfers
// Supports bridging between Base, Ethereum, and Lisk
// https://docs.relay.link/references/api/overview

import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID } from "@/config/chains";

const RELAY_API_BASE = "https://api.relay.link";

// Chain IDs for Relay
export const RELAY_CHAINS = {
    ETHEREUM: 1,
    BASE: 8453,
    LISK: LISK_MAINNET_CHAIN_ID, // 1135
    OPTIMISM: 10,
    ARBITRUM: 42161,
} as const;

// Token addresses on different chains
export const BRIDGE_TOKENS = {
    [RELAY_CHAINS.BASE]: {
        USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        ETH: "0x0000000000000000000000000000000000000000",
    },
    [RELAY_CHAINS.LISK]: {
        USDC: "0xF242275d3a6527d877f2c927a82D9b057609cc71", // USDC.e on Lisk
        ETH: "0x0000000000000000000000000000000000000000",
    },
    [RELAY_CHAINS.ETHEREUM]: {
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        ETH: "0x0000000000000000000000000000000000000000",
    },
} as const;

export interface BridgeQuote {
    requestId: string;
    originChainId: number;
    destinationChainId: number;
    originCurrency: string;
    destinationCurrency: string;
    originAmount: string;
    destinationAmount: string;
    fees: {
        gas: string;
        relayer: string;
        total: string;
    };
    estimatedTime: number; // seconds
    steps: BridgeStep[];
}

export interface BridgeStep {
    id: string;
    action: "approve" | "bridge" | "swap";
    description: string;
    data?: {
        to: string;
        data: string;
        value: string;
    };
}

export interface BridgeStatus {
    requestId: string;
    status: "pending" | "processing" | "completed" | "failed";
    originTxHash?: string;
    destinationTxHash?: string;
    completedAt?: number;
}

// Get a quote for bridging tokens
export async function getBridgeQuote(params: {
    originChainId: number;
    destinationChainId: number;
    originCurrency: string;
    destinationCurrency: string;
    amount: string;
    recipient: string;
    sender: string;
}): Promise<BridgeQuote | null> {
    try {
        const response = await fetch(`${RELAY_API_BASE}/quote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: params.sender,
                originChainId: params.originChainId,
                destinationChainId: params.destinationChainId,
                originCurrency: params.originCurrency,
                destinationCurrency: params.destinationCurrency,
                amount: params.amount,
                recipient: params.recipient,
                tradeType: "EXACT_INPUT",
            }),
        });

        if (!response.ok) {
            console.error("Relay quote error:", await response.text());
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to get bridge quote:", error);
        return null;
    }
}

// Get supported chains from Relay
export async function getSupportedChains(): Promise<any[]> {
    try {
        const response = await fetch(`${RELAY_API_BASE}/chains`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to get chains:", error);
        return [];
    }
}

// Check if Lisk is supported by Relay
export async function isLiskSupported(): Promise<boolean> {
    const chains = await getSupportedChains();
    return chains.some((chain: any) => chain.id === LISK_MAINNET_CHAIN_ID);
}

// Get bridge status
export async function getBridgeStatus(requestId: string): Promise<BridgeStatus | null> {
    try {
        const response = await fetch(`${RELAY_API_BASE}/requests/${requestId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Failed to get bridge status:", error);
        return null;
    }
}

// Generate Superbridge URL for manual bridging (fallback)
export function getSuperBridgeUrl(params: {
    fromChain: "ethereum" | "base";
    toChain: "lisk";
    token?: string;
}): string {
    const baseUrl = "https://superbridge.app/lisk";
    const searchParams = new URLSearchParams();
    
    if (params.fromChain === "base") {
        searchParams.set("fromChainId", "8453");
    } else {
        searchParams.set("fromChainId", "1");
    }
    
    if (params.token) {
        searchParams.set("token", params.token);
    }
    
    return `${baseUrl}?${searchParams.toString()}`;
}

// Estimate bridge time based on route
export function estimateBridgeTime(
    originChainId: number,
    destinationChainId: number
): { fast: number; standard: number } {
    // Relay instant bridges are typically < 30 seconds
    // Standard OP Stack bridges take ~7 days for withdrawals
    
    const isRelaySupported = [
        RELAY_CHAINS.BASE,
        RELAY_CHAINS.ETHEREUM,
        RELAY_CHAINS.OPTIMISM,
        RELAY_CHAINS.ARBITRUM,
    ].includes(originChainId as any) && [
        RELAY_CHAINS.BASE,
        RELAY_CHAINS.ETHEREUM,
        RELAY_CHAINS.OPTIMISM,
        RELAY_CHAINS.ARBITRUM,
    ].includes(destinationChainId as any);
    
    if (isRelaySupported) {
        return { fast: 30, standard: 120 }; // 30 seconds to 2 minutes
    }
    
    // For Lisk via Superbridge
    if (destinationChainId === RELAY_CHAINS.LISK) {
        return { fast: 300, standard: 900 }; // 5-15 minutes for deposits
    }
    
    if (originChainId === RELAY_CHAINS.LISK) {
        return { fast: 604800, standard: 604800 }; // 7 days for withdrawals (OP Stack)
    }
    
    return { fast: 600, standard: 1800 }; // Default 10-30 minutes
}
