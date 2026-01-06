import { NextRequest, NextResponse } from "next/server";

// Onramper webhook events
// Docs: https://docs.onramper.com/docs/webhooks

interface OnramperWebhookPayload {
  eventType: "transaction_completed" | "transaction_failed" | "transaction_pending";
  transactionId: string;
  status: string;
  fiatCurrency: string;
  fiatAmount: number;
  cryptoCurrency: string;
  cryptoAmount: number;
  walletAddress: string;
  network: string;
  timestamp: string;
  partnerContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: OnramperWebhookPayload = await request.json();

    console.log("[Onramper Webhook]", {
      event: payload.eventType,
      txId: payload.transactionId,
      status: payload.status,
      fiat: `${payload.fiatAmount} ${payload.fiatCurrency}`,
      crypto: `${payload.cryptoAmount} ${payload.cryptoCurrency}`,
      wallet: payload.walletAddress,
      network: payload.network,
    });

    // Handle different event types
    switch (payload.eventType) {
      case "transaction_completed":
        // User successfully purchased crypto
        // Could trigger: notification, auto-bridge, update UI
        console.log(`✅ Purchase complete: ${payload.cryptoAmount} ${payload.cryptoCurrency} → ${payload.walletAddress}`);
        break;

      case "transaction_failed":
        console.log(`❌ Purchase failed: ${payload.transactionId}`);
        break;

      case "transaction_pending":
        console.log(`⏳ Purchase pending: ${payload.transactionId}`);
        break;
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true, transactionId: payload.transactionId });

  } catch (error) {
    console.error("[Onramper Webhook Error]", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    service: "onramper-webhook",
    timestamp: new Date().toISOString()
  });
}
