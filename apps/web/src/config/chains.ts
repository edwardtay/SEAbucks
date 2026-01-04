export const LISK_SEPOLIA_CHAIN_ID = 4202;
export const LISK_MAINNET_CHAIN_ID = 1135;

export type SupportedChainId = typeof LISK_SEPOLIA_CHAIN_ID | typeof LISK_MAINNET_CHAIN_ID;

export const SUPPORTED_CHAINS = [LISK_SEPOLIA_CHAIN_ID, LISK_MAINNET_CHAIN_ID];

// Helper to get generic config based on chain
export function getChainConfig<T>(config: Record<SupportedChainId, T>, chainId: number): T {
    if (chainId === LISK_MAINNET_CHAIN_ID) return config[LISK_MAINNET_CHAIN_ID];
    return config[LISK_SEPOLIA_CHAIN_ID]; // Default to Testnet
}
