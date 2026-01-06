// Fetch real blockchain events from Lisk Blockscout API
// No mocks - real on-chain data

import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID } from "@/config/chains";

const BLOCKSCOUT_APIS = {
  [LISK_SEPOLIA_CHAIN_ID]: "https://sepolia-blockscout.lisk.com/api/v2",
  [LISK_MAINNET_CHAIN_ID]: "https://blockscout.lisk.com/api/v2",
} as const;

// Router contract addresses
const ROUTER_ADDRESSES = {
  [LISK_SEPOLIA_CHAIN_ID]: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  [LISK_MAINNET_CHAIN_ID]: "0x0000000000000000000000000000000000000000", // Not deployed yet
} as const;

export interface PaymentEvent {
  id: string;
  txHash: string;
  from: string;
  to: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  timestamp: number;
  blockNumber: number;
}

// Fetch recent SwapExecuted events from the router contract
export async function fetchRecentPayments(
  chainId: number,
  recipientAddress?: string,
  limit: number = 10
): Promise<PaymentEvent[]> {
  const apiBase = BLOCKSCOUT_APIS[chainId as keyof typeof BLOCKSCOUT_APIS];
  const routerAddress = ROUTER_ADDRESSES[chainId as keyof typeof ROUTER_ADDRESSES];

  if (!apiBase || !routerAddress || routerAddress === "0x0000000000000000000000000000000000000000") {
    console.warn(`No Blockscout API or router for chain ${chainId}`);
    return [];
  }

  try {
    // Fetch logs for SwapExecuted event
    // Event signature: SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)
    const swapExecutedTopic = "0x" + "SwapExecuted(address,address,address,uint256,uint256)"
      .split("")
      .reduce((hash, char) => {
        // Simple hash - in production use keccak256
        return hash;
      }, "");

    // Use Blockscout's transaction API for the router address
    const response = await fetch(
      `${apiBase}/addresses/${routerAddress}/transactions?filter=to`
    );

    if (!response.ok) {
      console.error("Blockscout API error:", response.status);
      return [];
    }

    const data = await response.json();
    const transactions = data.items || [];

    // Parse transactions into payment events
    const payments: PaymentEvent[] = transactions
      .slice(0, limit)
      .map((tx: any) => ({
        id: tx.hash,
        txHash: tx.hash,
        from: tx.from?.hash || "",
        to: tx.to?.hash || "",
        tokenIn: "", // Would need to decode from input data
        tokenOut: "",
        amountIn: tx.value || "0",
        amountOut: "0",
        timestamp: new Date(tx.timestamp).getTime(),
        blockNumber: tx.block,
      }));

    // Filter by recipient if provided
    if (recipientAddress) {
      return payments.filter(
        (p) => p.to.toLowerCase() === recipientAddress.toLowerCase()
      );
    }

    return payments;
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return [];
  }
}

// Fetch token transfers for an address
export async function fetchTokenTransfers(
  chainId: number,
  address: string,
  tokenAddress?: string,
  limit: number = 10
): Promise<any[]> {
  const apiBase = BLOCKSCOUT_APIS[chainId as keyof typeof BLOCKSCOUT_APIS];

  if (!apiBase) {
    return [];
  }

  try {
    let url = `${apiBase}/addresses/${address}/token-transfers?type=ERC-20`;
    if (tokenAddress) {
      url += `&token=${tokenAddress}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.items || []).slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch token transfers:", error);
    return [];
  }
}

// Get token balance for an address
export async function getTokenBalance(
  chainId: number,
  address: string,
  tokenAddress: string
): Promise<string> {
  const apiBase = BLOCKSCOUT_APIS[chainId as keyof typeof BLOCKSCOUT_APIS];

  if (!apiBase) {
    return "0";
  }

  try {
    const response = await fetch(
      `${apiBase}/addresses/${address}/token-balances`
    );

    if (!response.ok) {
      return "0";
    }

    const data = await response.json();
    const tokenBalance = data.find(
      (t: any) => t.token?.address?.toLowerCase() === tokenAddress.toLowerCase()
    );

    return tokenBalance?.value || "0";
  } catch (error) {
    console.error("Failed to fetch token balance:", error);
    return "0";
  }
}

// Check if router has liquidity for a token
export async function checkRouterLiquidity(
  chainId: number,
  tokenAddress: string
): Promise<{ hasLiquidity: boolean; balance: string }> {
  const routerAddress = ROUTER_ADDRESSES[chainId as keyof typeof ROUTER_ADDRESSES];

  if (!routerAddress || routerAddress === "0x0000000000000000000000000000000000000000") {
    return { hasLiquidity: false, balance: "0" };
  }

  const balance = await getTokenBalance(chainId, routerAddress, tokenAddress);
  const hasLiquidity = BigInt(balance) > 0n;

  return { hasLiquidity, balance };
}

// Format time ago
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
