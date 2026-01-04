
import { NextResponse } from "next/server";
import { createWalletClient, http, parseUnits, keccak256, encodePacked, encodeAbiParameters, parseAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { liskSepolia } from "viem/chains"; // Or generic chain if needed

// MOCK CONSTANTS FOR DEV/HACKATHON
// In prod, use process.env.DEALER_PRIVATE_KEY
// This is Hardhat Account #0
const DEALER_PK = process.env.DEALER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const account = privateKeyToAccount(DEALER_PK as `0x${string}`);

// REPLACE with valid deployed address after deployment!
// For now we use a placeholder that matches what we might deploy to or updated via env.
// TODO: Update this after deployment or via ENV
const PROD_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost Mock

// Domain Separator Data
const DOMAIN = {
    name: "SEABucksRouter",
    version: "1",
    chainId: 31337, // Hardhat Localhost. Change to 4202 (Lisk Sepolia) for testnet
    verifyingContract: PROD_ROUTER_ADDRESS as `0x${string}`,
};

const TYPES = {
    Quote: [
        { name: "tokenIn", type: "address" },
        { name: "tokenOut", type: "address" },
        { name: "amountIn", type: "uint256" },
        { name: "amountOut", type: "uint256" },
        { name: "recipient", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ],
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tokenIn, tokenOut, amountIn, recipient, chainId } = body;

        if (!tokenIn || !tokenOut || !amountIn || !recipient) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // 1. Fetch Real Rate
        // Using open.er-api.com for public free rates. Base is USD.
        // We assume tokenIn is USDC (Pegged to USD).
        // If tokenIn is not USDC, we'd need a cross rate.
        // SEABucks simplifies: Payer pays USDC.

        // Map tokenOut address to Symbol (e.g. IDR, THB)
        // For Hackathon, we can just look up the map reversed or trust the symbol passed.
        // Let's passed symbol in body for simplicity or rely on map

        // HACK: Simulating Fetch for now to ensure speed, or use real fetch:
        const currencyMap: Record<string, string> = {
            "0xcfF09905F8f18B35F5A1Ba6d2822D62B3d8c48bE": "IDR", // Mock Address from Currencies.ts
            // Add others if needed:
            // ...
        };

        // Just for demo, let's fetch USD to IDR/THB etc
        // If we don't know the address mapping, we fallback or require symbol param.

        const targetCurrency = body.symbol || "IDR"; // Fallback

        let rate = 15000; // Mock default

        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
            const data = await res.json();
            if (data && data.rates && data.rates[targetCurrency]) {
                rate = data.rates[targetCurrency];
            }
        } catch (e) {
            console.error("Failed to fetch rates, using fallback", e);
        }

        // Amount Calculation
        // amountIn is in Wei (18 decimals for USDC assumption in this mock/testnet, but usually 6).
        // Let's assume 18 decimals for standard ERC20 mocks in this project.

        // 1 USDC (1e18) * 15000 = 15000 IDR (1e18 if IDR has 18 decimals)
        // Rate is simple float.

        // Parsing amountIn (string) -> BigInt
        const amountInBig = BigInt(amountIn);

        // Calculate AmountOut
        // We need to handle decimals carefully. 
        // If rate is 15000.50, we multiply amountIn * rate.
        // For precision, amountIn * rate * 1e18 / 1e18... 
        // Simple: amountOut = amountIn * BigInt(Math.floor(rate)) (Losing decimal precision on rate)
        // Better: amountOut = amountIn * BigInt(Math.floor(rate * 100)) / 100n

        const rateScaled = BigInt(Math.floor(rate * 100));
        const amountOut = (amountInBig * rateScaled) / 100n;

        // 2. Sign the Quote
        // Create Client
        const client = createWalletClient({
            account,
            chain: undefined, // No transport needed for signing locally
            transport: http()
        });

        // Generate Nonce (Ideally strictly tracked, for now random/time based for statelessness demo)
        const nonce = BigInt(Date.now());
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 mins

        // Update Domain ChainID if provided
        const domain = { ...DOMAIN, chainId: chainId || DOMAIN.chainId };

        const signature = await client.signTypedData({
            domain,
            types: TYPES,
            primaryType: "Quote",
            message: {
                tokenIn: tokenIn as `0x${string}`,
                tokenOut: tokenOut as `0x${string}`,
                amountIn: amountInBig,
                amountOut: amountOut,
                recipient: recipient as `0x${string}`,
                nonce: nonce,
                deadline: deadline,
            }
        });

        return NextResponse.json({
            signature,
            amountOut: amountOut.toString(),
            nonce: nonce.toString(),
            deadline: deadline.toString(),
            rate: rate,
            tokenIn,
            tokenOut,
            recipient
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
