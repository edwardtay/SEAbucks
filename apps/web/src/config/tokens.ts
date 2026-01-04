import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID, SupportedChainId } from "./chains";

export type TokenCode = "USDC" | "USDT";

export interface Token {
    symbol: TokenCode;
    name: string;
    address: string;
    decimals: number;
    logo: string;
}

export const TOKENS: Record<SupportedChainId, Record<TokenCode, Token>> = {
    [LISK_SEPOLIA_CHAIN_ID]: {
        USDC: {
            symbol: "USDC",
            name: "USD Coin",
            address: "0xDb993d5dc583017b7624F650deBc8B140213C490", // Mock
            decimals: 18,
            logo: "/tokens/usdc.svg",
        },
        USDT: {
            symbol: "USDT",
            name: "Tether USD",
            address: "0xa503Be353e8aC83023961168B2912423De45F387", // Mock
            decimals: 18,
            logo: "/tokens/usdt.svg",
        }
    },
    [LISK_MAINNET_CHAIN_ID]: {
        USDC: {
            symbol: "USDC",
            name: "USD Coin",
            address: "0x1754802f5a8964724214227303c7391924618e47", // REAL Lisk Mainnet USDC (Bridged) - Example placeholder
            decimals: 6,
            logo: "/tokens/usdc.svg",
        },
        USDT: {
            symbol: "USDT",
            name: "Tether USD",
            address: "0x0000000000000000000000000000000000000000", // TODO: Find Mainnet Address
            decimals: 6,
            logo: "/tokens/usdt.svg",
        }
    }
};
