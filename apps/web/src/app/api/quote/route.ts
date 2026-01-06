import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { liskSepolia, lisk } from "viem/chains";
import { getExchangeRate, calculateConversion } from "@/lib/exchange-rates";
import { LISK_MAINNET_CHAIN_ID, LISK_SEPOLIA_CHAIN_ID } from "@/config/chains";
import { CurrencyCode } from "@/config/currencies";

// Dealer key MUST be set in environment - no fallback for security
const DEALER_PK = process.env.DEALER_PRIVATE_KEY;

if (!DEALER_PK) {
    console.error("❌ DEALER_PRIVATE_KEY not set - quote signing will fail");
}

// Will throw if DEALER_PK is not set (intentional - fail fast)
const account = DEALER_PK 
    ? privateKeyToAccount(DEALER_PK as `0x${string}`)
    : null;

// Router addresses per chain
const ROUTER_ADDRESSES: Record<number, `0x${string}`> = {
    [LISK_SEPOLIA_CHAIN_ID]: (process.env.NEXT_PUBLIC_ROUTER_ADDRESS_SEPOLIA || 
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as `0x${string}`,
    [LISK_MAINNET_CHAIN_ID]: (process.env.NEXT_PUBLIC_ROUTER_ADDRESS_MAINNET || 
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
};

// EIP-712 Types for quote signing
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

// Spread in basis points (0.5% = 50 bps)
const DEALER_SPREAD_BPS = parseInt(process.env.DEALER_SPREAD_BPS || "50");

// Quote validity in seconds
const QUOTE_VALIDITY_SECONDS = parseInt(process.env.QUOTE_VALIDITY_SECONDS || "300");

export async function POST(request: Request) {
    const startTime = Date.now();
    
    try {
        const body = await request.json();
        const { 
            tokenIn, 
            tokenOut, 
            amountIn, 
            recipient, 
            chainId = LISK_SEPOLIA_CHAIN_ID,
            symbol = "IDR" 
        } = body;

        // Validation
        if (!tokenIn || !tokenOut || !amountIn || !recipient) {
            return NextResponse.json(
                { error: "Missing required parameters: tokenIn, tokenOut, amountIn, recipient" }, 
                { status: 400 }
            );
        }

        if (!amountIn || BigInt(amountIn) <= 0n) {
            return NextResponse.json(
                { error: "Invalid amount" }, 
                { status: 400 }
            );
        }

        // Get router address for chain
        const routerAddress = ROUTER_ADDRESSES[chainId];
        if (!routerAddress || routerAddress === "0x0000000000000000000000000000000000000000") {
            return NextResponse.json(
                { error: `Router not deployed on chain ${chainId}` }, 
                { status: 400 }
            );
        }

        // Fetch real exchange rate
        const rateData = await getExchangeRate(symbol as CurrencyCode);
        
        // Parse amounts (assuming 6 decimals for USDC)
        const amountInBig = BigInt(amountIn);
        const amountInUSD = Number(amountInBig) / 1e6; // Convert from 6 decimals
        
        // Calculate conversion with spread
        const conversion = calculateConversion(amountInUSD, rateData.rate, DEALER_SPREAD_BPS);
        
        // Convert to target currency decimals (varies by currency)
        // IDR typically uses 2 decimals, VND uses 0
        const targetDecimals = symbol === "VND" ? 0 : 2;
        const amountOutScaled = BigInt(Math.floor(conversion.amountOut * Math.pow(10, targetDecimals)));
        
        // For demo: if target token is same as input (no real stablecoin), 
        // return equivalent USDC amount (1:1 for demo)
        const finalAmountOut = tokenOut === "0x0000000000000000000000000000000000000000" 
            ? amountInBig 
            : amountOutScaled;

        // Generate nonce (production: use database counter per user)
        const nonce = BigInt(Date.now());
        const deadline = BigInt(Math.floor(Date.now() / 1000) + QUOTE_VALIDITY_SECONDS);

        // Require dealer key for signing
        if (!account) {
            return NextResponse.json(
                { success: false, error: "Server not configured for signing" },
                { status: 500 }
            );
        }

        // Build domain for EIP-712
        const domain = {
            name: "CurrenSEARouter",
            version: "1",
            chainId: chainId,
            verifyingContract: routerAddress,
        };

        // Create wallet client for signing
        const client = createWalletClient({
            account: account!,
            chain: chainId === LISK_MAINNET_CHAIN_ID ? lisk : liskSepolia,
            transport: http(),
        });

        // Sign the quote
        const signature = await client.signTypedData({
            domain,
            types: TYPES,
            primaryType: "Quote",
            message: {
                tokenIn: tokenIn as `0x${string}`,
                tokenOut: tokenOut as `0x${string}`,
                amountIn: amountInBig,
                amountOut: finalAmountOut,
                recipient: recipient as `0x${string}`,
                nonce,
                deadline,
            },
        });

        const processingTime = Date.now() - startTime;

        return NextResponse.json({
            // Quote data
            signature,
            amountIn: amountInBig.toString(),
            amountOut: finalAmountOut.toString(),
            nonce: nonce.toString(),
            deadline: deadline.toString(),
            
            // Rate info
            rate: rateData.rate,
            effectiveRate: conversion.effectiveRate,
            spreadBps: DEALER_SPREAD_BPS,
            rateSource: rateData.source,
            
            // Token info
            tokenIn,
            tokenOut,
            recipient,
            chainId,
            
            // Metadata
            quotedAt: Date.now(),
            expiresAt: Number(deadline) * 1000,
            processingTimeMs: processingTime,
            
            // Dealer info
            dealer: account!.address,
            routerAddress,
        });

    } catch (error: any) {
        console.error("Quote API error:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to generate quote",
                code: "QUOTE_ERROR",
            }, 
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: account ? "ok" : "not_configured",
        dealer: account?.address || null,
        supportedChains: Object.keys(ROUTER_ADDRESSES).map(Number),
        spreadBps: DEALER_SPREAD_BPS,
        quoteValiditySeconds: QUOTE_VALIDITY_SECONDS,
    });
}
