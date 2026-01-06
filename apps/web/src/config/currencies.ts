import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID, SupportedChainId } from "./chains";

export type CurrencyCode = "IDR" | "THB" | "VND" | "PHP" | "MYR" | "SGD";

export interface Currency {
    code: CurrencyCode;
    name: string;
    country: string;
    address: `0x${string}`;
    flag: string;
    decimals: number;
    // Real-world payment rails available
    paymentRails: string[];
}

// IDRX is a real IDR stablecoin deployed on Lisk
// https://docs.lisk.com/about-lisk/deployed-tokens
export const CURRENCIES: Record<SupportedChainId, Record<CurrencyCode, Currency>> = {
    [LISK_SEPOLIA_CHAIN_ID]: {
        IDR: {
            code: "IDR",
            name: "Indonesian Rupiah",
            country: "Indonesia",
            address: "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661", // Real IDRX on Lisk Sepolia
            flag: "/flags/id.svg",
            decimals: 2,
            paymentRails: ["QRIS", "GoPay", "OVO", "Dana", "Bank Transfer"],
        },
        THB: {
            code: "THB",
            name: "Thai Baht",
            country: "Thailand",
            address: "0x0000000000000000000000000000000000000000", // Placeholder - no THB stablecoin yet
            flag: "/flags/th.svg",
            decimals: 2,
            paymentRails: ["PromptPay", "TrueMoney", "Bank Transfer"],
        },
        VND: {
            code: "VND",
            name: "Vietnamese Dong",
            country: "Vietnam",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/vn.svg",
            decimals: 0, // VND has no decimal places
            paymentRails: ["VNPay", "MoMo", "ZaloPay", "Bank Transfer"],
        },
        PHP: {
            code: "PHP",
            name: "Philippine Peso",
            country: "Philippines",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/ph.svg",
            decimals: 2,
            paymentRails: ["GCash", "Maya", "InstaPay", "Bank Transfer"],
        },
        MYR: {
            code: "MYR",
            name: "Malaysian Ringgit",
            country: "Malaysia",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/my.svg",
            decimals: 2,
            paymentRails: ["DuitNow", "Touch n Go", "Boost", "Bank Transfer"],
        },
        SGD: {
            code: "SGD",
            name: "Singapore Dollar",
            country: "Singapore",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/sg.svg",
            decimals: 2,
            paymentRails: ["PayNow", "GrabPay", "Bank Transfer"],
        },
    },
    [LISK_MAINNET_CHAIN_ID]: {
        IDR: {
            code: "IDR",
            name: "Indonesian Rupiah",
            country: "Indonesia",
            address: "0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22", // Real IDRX on Lisk Mainnet
            flag: "/flags/id.svg",
            decimals: 2,
            paymentRails: ["QRIS", "GoPay", "OVO", "Dana", "Bank Transfer"],
        },
        THB: {
            code: "THB",
            name: "Thai Baht",
            country: "Thailand",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/th.svg",
            decimals: 2,
            paymentRails: ["PromptPay", "TrueMoney", "Bank Transfer"],
        },
        VND: {
            code: "VND",
            name: "Vietnamese Dong",
            country: "Vietnam",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/vn.svg",
            decimals: 0,
            paymentRails: ["VNPay", "MoMo", "ZaloPay", "Bank Transfer"],
        },
        PHP: {
            code: "PHP",
            name: "Philippine Peso",
            country: "Philippines",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/ph.svg",
            decimals: 2,
            paymentRails: ["GCash", "Maya", "InstaPay", "Bank Transfer"],
        },
        MYR: {
            code: "MYR",
            name: "Malaysian Ringgit",
            country: "Malaysia",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/my.svg",
            decimals: 2,
            paymentRails: ["DuitNow", "Touch n Go", "Boost", "Bank Transfer"],
        },
        SGD: {
            code: "SGD",
            name: "Singapore Dollar",
            country: "Singapore",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/sg.svg",
            decimals: 2,
            paymentRails: ["PayNow", "GrabPay", "Bank Transfer"],
        },
    }
};

// Helper to check if a currency has a real stablecoin deployed
export function hasCurrencyStablecoin(currency: Currency): boolean {
    return currency.address !== "0x0000000000000000000000000000000000000000";
}

// Get available currencies (those with real stablecoins)
export function getAvailableCurrencies(chainId: SupportedChainId): Currency[] {
    return Object.values(CURRENCIES[chainId]).filter(hasCurrencyStablecoin);
}
