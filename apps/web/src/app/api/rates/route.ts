import { NextResponse } from "next/server";
import { getAllSEARates, getExchangeRate } from "@/lib/exchange-rates";
import { CurrencyCode } from "@/config/currencies";

// GET /api/rates - Get all SEA currency rates
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") as CurrencyCode | null;
    
    try {
        if (currency) {
            // Get single currency rate
            const rate = await getExchangeRate(currency);
            return NextResponse.json({
                success: true,
                data: rate,
            });
        }
        
        // Get all SEA rates
        const rates = await getAllSEARates();
        
        return NextResponse.json({
            success: true,
            data: rates,
            timestamp: Date.now(),
        });
    } catch (error: any) {
        console.error("Rates API error:", error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message || "Failed to fetch rates" 
            }, 
            { status: 500 }
        );
    }
}
