// One-Click On-Ramp: Fiat → USDC → Bridge → Lisk → Swap to Local Currency
// This combines multiple steps into a single user flow

import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID } from "@/config/chains";
import { CurrencyCode } from "@/config/currencies";

// Relay.link API for cross-chain execution
const RELAY_API = "https://api.relay.link";

// Chain IDs
const CHAINS = {
  BASE: 8453,
  LISK: LISK_MAINNET_CHAIN_ID,
  ETHEREUM: 1,
} as const;

// Token addresses
const TOKENS = {
  BASE_USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  LISK_USDC: "0xF242275d3a6527d877f2c927a82D9b057609cc71",
  LISK_IDRX: "0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22",
} as const;

export interface OneClickOnrampParams {
  fiatCurrency: "PHP" | "MYR" | "VND" | "USD";
  fiatAmount: number;
  targetCurrency: CurrencyCode;
  recipientAddress: string;
  userAddress: string;
}

export interface OneClickOnrampQuote {
  // Step 1: Fiat to USDC (via Transak)
  transakUrl: string;
  usdcAmount: string;
  
  // Step 2: Bridge + Swap (via Relay or manual)
  bridgeMethod: "relay" | "superbridge";
  bridgeUrl?: string;
  
  // Step 3: Final output
  estimatedOutput: string;
  outputCurrency: CurrencyCode;
  
  // Fees breakdown
  fees: {
    transakFee: string;
    bridgeFee: string;
    swapFee: string;
    totalFeePercent: string;
  };
  
  // Timing
  estimatedTime: string;
}

// Build Transak URL with webhook for automatic next step
export function buildTransakOnrampUrl(params: {
  fiatCurrency: string;
  fiatAmount: number;
  cryptoCurrency: string;
  network: string;
  walletAddress: string;
  redirectUrl?: string;
}): string {
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "";
  const env = process.env.NEXT_PUBLIC_TRANSAK_ENV || "STAGING";
  
  const baseUrl = env === "PRODUCTION" 
    ? "https://global.transak.com" 
    : "https://global-stg.transak.com";

  const searchParams = new URLSearchParams({
    apiKey,
    environment: env,
    cryptoCurrencyCode: params.cryptoCurrency,
    network: params.network,
    defaultCryptoCurrency: params.cryptoCurrency,
    walletAddress: params.walletAddress,
    disableWalletAddressForm: "true",
    fiatCurrency: params.fiatCurrency,
    defaultFiatAmount: params.fiatAmount.toString(),
    productsAvailed: "BUY",
    themeColor: "3b82f6",
    hideMenu: "true",
  });

  if (params.redirectUrl) {
    searchParams.set("redirectURL", params.redirectUrl);
  }

  return `${baseUrl}?${searchParams.toString()}`;
}

// Get quote for cross-chain swap via Relay
export async function getRelayBridgeSwapQuote(params: {
  originChainId: number;
  destinationChainId: number;
  originToken: string;
  destinationToken: string;
  amount: string;
  recipient: string;
  sender: string;
}): Promise<any> {
  try {
    const response = await fetch(`${RELAY_API}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: params.sender,
        originChainId: params.originChainId,
        destinationChainId: params.destinationChainId,
        originCurrency: params.originToken,
        destinationCurrency: params.destinationToken,
        amount: params.amount,
        recipient: params.recipient,
        tradeType: "EXACT_INPUT",
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Relay quote error:", error);
    return null;
  }
}

// Generate complete one-click onramp flow
export async function generateOneClickOnrampFlow(
  params: OneClickOnrampParams
): Promise<OneClickOnrampQuote> {
  const { fiatCurrency, fiatAmount, targetCurrency, recipientAddress, userAddress } = params;

  // Calculate USDC amount (rough estimate, Transak will give exact)
  // Transak typically charges 1-3% depending on payment method
  const transakFeePercent = 2.5;
  const estimatedUsdcAmount = fiatAmount * (1 - transakFeePercent / 100);

  // Build Transak URL - buy USDC on Base (best liquidity)
  const transakUrl = buildTransakOnrampUrl({
    fiatCurrency,
    fiatAmount,
    cryptoCurrency: "USDC",
    network: "base",
    walletAddress: userAddress,
    redirectUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/onramp/complete`,
  });

  // Check if Relay supports Lisk for direct bridge+swap
  // If not, use Superbridge
  const relayQuote = await getRelayBridgeSwapQuote({
    originChainId: CHAINS.BASE,
    destinationChainId: CHAINS.LISK,
    originToken: TOKENS.BASE_USDC,
    destinationToken: targetCurrency === "IDR" ? TOKENS.LISK_IDRX : TOKENS.LISK_USDC,
    amount: (estimatedUsdcAmount * 1e6).toString(), // USDC has 6 decimals
    recipient: recipientAddress,
    sender: userAddress,
  });

  const bridgeMethod = relayQuote ? "relay" : "superbridge";
  const bridgeFeePercent = relayQuote ? 0.1 : 0.05; // Relay ~0.1%, Superbridge just gas

  // Get FX rate for final output calculation
  let fxRate = 1;
  try {
    const rateRes = await fetch(`https://open.er-api.com/v6/latest/USD`);
    const rateData = await rateRes.json();
    fxRate = rateData.rates?.[targetCurrency] || 1;
  } catch {
    // Use fallback rates
    const fallbackRates: Record<string, number> = {
      IDR: 16250, PHP: 58.5, VND: 25400, THB: 34.5, MYR: 4.45, SGD: 1.35
    };
    fxRate = fallbackRates[targetCurrency] || 1;
  }

  // Calculate final output (after all fees)
  const swapFeePercent = 0.5; // SEAbucks dealer spread
  const afterBridgeFee = estimatedUsdcAmount * (1 - bridgeFeePercent / 100);
  const afterSwapFee = afterBridgeFee * (1 - swapFeePercent / 100);
  const finalOutput = afterSwapFee * fxRate;

  const totalFeePercent = transakFeePercent + bridgeFeePercent + swapFeePercent;

  return {
    transakUrl,
    usdcAmount: estimatedUsdcAmount.toFixed(2),
    bridgeMethod,
    bridgeUrl: bridgeMethod === "superbridge" 
      ? "https://superbridge.app/lisk" 
      : undefined,
    estimatedOutput: finalOutput.toLocaleString(undefined, { maximumFractionDigits: 0 }),
    outputCurrency: targetCurrency,
    fees: {
      transakFee: `${transakFeePercent}%`,
      bridgeFee: `${bridgeFeePercent}%`,
      swapFee: `${swapFeePercent}%`,
      totalFeePercent: `${totalFeePercent.toFixed(1)}%`,
    },
    estimatedTime: bridgeMethod === "relay" ? "~2 minutes" : "~10 minutes",
  };
}

// Value proposition calculator
export function calculateValueProposition(params: {
  amount: number;
  currency: CurrencyCode;
}): {
  traditional: { fee: number; time: string; steps: number };
  seabucks: { fee: number; time: string; steps: number };
  savings: { fee: number; time: string; steps: number };
} {
  const { amount } = params;

  // Traditional cross-border payment (SWIFT/Cards)
  const traditionalFeePercent = 5; // 3-7% typical
  const traditionalFee = amount * (traditionalFeePercent / 100);

  // SEAbucks
  const seabucksFeePercent = 3.1; // Transak 2.5% + Bridge 0.1% + Swap 0.5%
  const seabucksFee = amount * (seabucksFeePercent / 100);

  return {
    traditional: {
      fee: traditionalFee,
      time: "3-5 days",
      steps: 5,
    },
    seabucks: {
      fee: seabucksFee,
      time: "~10 minutes",
      steps: 2,
    },
    savings: {
      fee: traditionalFee - seabucksFee,
      time: "3-5 days saved",
      steps: 3,
    },
  };
}
