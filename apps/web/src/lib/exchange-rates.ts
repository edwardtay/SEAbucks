// Real-time exchange rate service using multiple providers for redundancy
// Primary: Exchange Rate API (free tier)
// Fallback: Open Exchange Rates

import { CurrencyCode } from "@/config/currencies";

interface ExchangeRateResponse {
    rate: number;
    source: string;
    timestamp: number;
    baseCurrency: string;
    targetCurrency: string;
}

interface RateCache {
    [key: string]: {
        rate: number;
        timestamp: number;
        source: string;
    };
}

// Cache rates for 60 seconds to reduce API calls
const CACHE_TTL_MS = 60 * 1000;
const rateCache: RateCache = {};

// Primary provider: Exchange Rate API (free, no key required)
async function fetchFromExchangeRateAPI(targetCurrency: CurrencyCode): Promise<number | null> {
    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/USD`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.result === "success" && data.rates?.[targetCurrency]) {
            return data.rates[targetCurrency];
        }
        return null;
    } catch (error) {
        console.error("Exchange Rate API error:", error);
        return null;
    }
}

// Fallback provider: Frankfurter API (ECB rates, free)
async function fetchFromFrankfurter(targetCurrency: CurrencyCode): Promise<number | null> {
    try {
        // Frankfurter doesn't support all SEA currencies, but good for SGD, MYR
        const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${targetCurrency}`);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.rates?.[targetCurrency]) {
            return data.rates[targetCurrency];
        }
        return null;
    } catch (error) {
        console.error("Frankfurter API error:", error);
        return null;
    }
}

// Hardcoded fallback rates (updated periodically) - last resort
const FALLBACK_RATES: Record<CurrencyCode, number> = {
    IDR: 16250,  // 1 USD = ~16,250 IDR
    THB: 34.5,   // 1 USD = ~34.5 THB
    VND: 25400,  // 1 USD = ~25,400 VND
    PHP: 58.5,   // 1 USD = ~58.5 PHP
    MYR: 4.45,   // 1 USD = ~4.45 MYR
    SGD: 1.35,   // 1 USD = ~1.35 SGD
};

export async function getExchangeRate(targetCurrency: CurrencyCode): Promise<ExchangeRateResponse> {
    const cacheKey = `USD_${targetCurrency}`;
    const now = Date.now();
    
    // Check cache first
    if (rateCache[cacheKey] && (now - rateCache[cacheKey].timestamp) < CACHE_TTL_MS) {
        return {
            rate: rateCache[cacheKey].rate,
            source: rateCache[cacheKey].source + " (cached)",
            timestamp: rateCache[cacheKey].timestamp,
            baseCurrency: "USD",
            targetCurrency,
        };
    }
    
    // Try primary provider
    let rate = await fetchFromExchangeRateAPI(targetCurrency);
    let source = "Exchange Rate API";
    
    // Try fallback if primary fails
    if (rate === null) {
        rate = await fetchFromFrankfurter(targetCurrency);
        source = "Frankfurter API";
    }
    
    // Use hardcoded fallback as last resort
    if (rate === null) {
        rate = FALLBACK_RATES[targetCurrency];
        source = "Fallback (offline)";
    }
    
    // Update cache
    rateCache[cacheKey] = {
        rate,
        timestamp: now,
        source,
    };
    
    return {
        rate,
        source,
        timestamp: now,
        baseCurrency: "USD",
        targetCurrency,
    };
}

// Get all SEA rates at once (more efficient)
export async function getAllSEARates(): Promise<Record<CurrencyCode, ExchangeRateResponse>> {
    const currencies: CurrencyCode[] = ["IDR", "THB", "VND", "PHP", "MYR", "SGD"];
    
    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
        const data = await response.json();
        
        const results: Record<string, ExchangeRateResponse> = {};
        const now = Date.now();
        
        for (const currency of currencies) {
            const rate = data.rates?.[currency] || FALLBACK_RATES[currency];
            results[currency] = {
                rate,
                source: data.rates?.[currency] ? "Exchange Rate API" : "Fallback",
                timestamp: now,
                baseCurrency: "USD",
                targetCurrency: currency,
            };
            
            // Update cache
            rateCache[`USD_${currency}`] = {
                rate,
                timestamp: now,
                source: results[currency].source,
            };
        }
        
        return results as Record<CurrencyCode, ExchangeRateResponse>;
    } catch (error) {
        // Return fallback rates on error
        const results: Record<string, ExchangeRateResponse> = {};
        const now = Date.now();
        
        for (const currency of currencies) {
            results[currency] = {
                rate: FALLBACK_RATES[currency],
                source: "Fallback (offline)",
                timestamp: now,
                baseCurrency: "USD",
                targetCurrency: currency,
            };
        }
        
        return results as Record<CurrencyCode, ExchangeRateResponse>;
    }
}

// Calculate conversion with spread (for dealer margin)
export function calculateConversion(
    amountUSD: number,
    rate: number,
    spreadBps: number = 50 // 0.5% default spread
): { amountOut: number; effectiveRate: number; spreadAmount: number } {
    const spreadMultiplier = 1 - (spreadBps / 10000);
    const effectiveRate = rate * spreadMultiplier;
    const amountOut = amountUSD * effectiveRate;
    const spreadAmount = amountUSD * rate - amountOut;
    
    return {
        amountOut,
        effectiveRate,
        spreadAmount,
    };
}
