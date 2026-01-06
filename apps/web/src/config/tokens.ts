import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID, SupportedChainId } from "./chains";

export type TokenCode = "USDC" | "USDT";

export interface Token {
    symbol: TokenCode;
    name: string;
    address: `0x${string}`;
    decimals: number;
    logo: string;
    coingeckoId?: string;
}

// Real deployed token addresses from Lisk documentation
// https://docs.lisk.com/about-lisk/deployed-tokens
export const TOKENS: Record<SupportedChainId, Record<TokenCode, Token>> = {
    [LISK_SEPOLIA_CHAIN_ID]: {
        USDC: {
            symbol: "USDC",
            name: "Bridged USDC (Lisk Sepolia)",
            address: "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83", // Real Lisk Sepolia USDC.e
            decimals: 6, // USDC uses 6 decimals
            logo: "/tokens/usdc.svg",
            coingeckoId: "usd-coin",
        },
        USDT: {
            symbol: "USDT",
            name: "Tether USD",
            address: "0x0000000000000000000000000000000000000000", // Not deployed on Sepolia
            decimals: 6,
            logo: "/tokens/usdt.svg",
            coingeckoId: "tether",
        }
    },
    [LISK_MAINNET_CHAIN_ID]: {
        USDC: {
            symbol: "USDC",
            name: "Bridged USDC (Lisk)",
            address: "0xF242275d3a6527d877f2c927a82D9b057609cc71", // Real Lisk Mainnet USDC.e
            decimals: 6,
            logo: "/tokens/usdc.svg",
            coingeckoId: "usd-coin",
        },
        USDT: {
            symbol: "USDT",
            name: "Tether USD",
            address: "0x05D032ac25d322df992303dCa074EE7392C117b9", // Real Lisk Mainnet USDT
            decimals: 6,
            logo: "/tokens/usdt.svg",
            coingeckoId: "tether",
        }
    }
};

// Base chain tokens for bridging (Relay.link supported)
export const BASE_TOKENS = {
    USDC: {
        symbol: "USDC",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`, // Base Mainnet USDC
        decimals: 6,
    },
    USDT: {
        symbol: "USDT", 
        address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" as `0x${string}`, // Base Mainnet USDT
        decimals: 6,
    }
};
