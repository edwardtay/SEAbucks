import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID, SupportedChainId } from "./chains";

export type CurrencyCode = "IDR" | "THB" | "VND" | "PHP" | "MYR" | "SGD" | "BND" | "KHR" | "LAK" | "MMK";

export interface Currency {
    code: CurrencyCode;
    name: string;
    address: string;
    flag: string;
}

export const CURRENCIES: Record<SupportedChainId, Record<CurrencyCode, Currency>> = {
    [LISK_SEPOLIA_CHAIN_ID]: {
        IDR: {
            code: "IDR",
            name: "Indonesia",
            address: "0xcfF09905F8f18B35F5A1Ba6d2822D62B3d8c48bE",
            flag: "/flags/id.svg",
        },
        THB: {
            code: "THB",
            name: "Thailand",
            address: "0xf98a4A0482d534c004cdB9A3358fd71347c4395B",
            flag: "/flags/th.svg",
        },
        VND: {
            code: "VND",
            name: "Vietnam",
            address: "0xa7056B7d2d7B97dE9F254C17Ab7E0470E5F112c0",
            flag: "/flags/vn.svg",
        },
        PHP: {
            code: "PHP",
            name: "Philippines",
            address: "0x073b61f5Ed26d802b05301e0E019f78Ac1A41D23",
            flag: "/flags/ph.svg",
        },
        MYR: {
            code: "MYR",
            name: "Malaysia",
            address: "0x8F878deCd44f7Cf547D559a6e6D0577E370fa0Db",
            flag: "/flags/my.svg",
        },
        SGD: {
            code: "SGD",
            name: "Singapore",
            address: "0xEff2eC240CEB2Ddf582Df0e42fc66a6910D3Fe3f",
            flag: "/flags/sg.svg",
        },
        BND: {
            code: "BND",
            name: "Brunei",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/bn.svg",
        },
        KHR: {
            code: "KHR",
            name: "Cambodia",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/kh.svg",
        },
        LAK: {
            code: "LAK",
            name: "Laos",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/la.svg",
        },
        MMK: {
            code: "MMK",
            name: "Myanmar",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/mm.svg",
        },
    },
    [LISK_MAINNET_CHAIN_ID]: {
        IDR: {
            code: "IDR",
            name: "Indonesia",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/id.svg",
        },
        THB: {
            code: "THB",
            name: "Thailand",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/th.svg",
        },
        VND: {
            code: "VND",
            name: "Vietnam",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/vn.svg",
        },
        PHP: {
            code: "PHP",
            name: "Philippines",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/ph.svg",
        },
        MYR: {
            code: "MYR",
            name: "Malaysia",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/my.svg",
        },
        SGD: {
            code: "SGD",
            name: "Singapore",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/sg.svg",
        },
        BND: {
            code: "BND",
            name: "Brunei",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/bn.svg",
        },
        KHR: {
            code: "KHR",
            name: "Cambodia",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/kh.svg",
        },
        LAK: {
            code: "LAK",
            name: "Laos",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/la.svg",
        },
        MMK: {
            code: "MMK",
            name: "Myanmar",
            address: "0x0000000000000000000000000000000000000000",
            flag: "/flags/mm.svg",
        },
    }
};
