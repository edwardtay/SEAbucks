# currenSEA

Cross-border stablecoin payments for Southeast Asia. Accept USDC globally, settle in local currency atomically.

**Live:** Lisk Sepolia | **Stack:** Next.js 16 + Solidity 0.8.28 + EIP-712

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           currenSEA Flow                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Payer                    API                      Contract             │
│    │                       │                          │                 │
│    │──── GET /api/quote ──►│                          │                 │
│    │     (amount, token)   │                          │                 │
│    │                       │                          │                 │
│    │                       │── fetch FX rate ────────►│                 │
│    │                       │   (open.er-api.com)      │                 │
│    │                       │                          │                 │
│    │                       │── EIP-712 sign ─────────►│                 │
│    │                       │   (dealer wallet)        │                 │
│    │                       │                          │                 │
│    │◄─── signed quote ─────│                          │                 │
│    │     (sig, amounts)    │                          │                 │
│    │                       │                          │                 │
│    │──── approve USDC ────────────────────────────────►│                │
│    │                                                   │                │
│    │──── swapWithSignature ───────────────────────────►│                │
│    │     (quote + sig)                                 │                │
│    │                                                   │                │
│    │                                    ┌──────────────┴──────────────┐ │
│    │                                    │  1. verify sig (ECDSA)     │ │
│    │                                    │  2. check deadline         │ │
│    │                                    │  3. check nonce            │ │
│    │                                    │  4. pull USDC from payer   │ │
│    │                                    │  5. push IDRX to merchant  │ │
│    │                                    └─────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Contracts

| Network | Contract | Address |
|---------|----------|---------|
| Lisk Sepolia | Router | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| Lisk Sepolia | USDC.e | `0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83` |
| Lisk Sepolia | IDRX | `0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661` |
| Lisk Mainnet | USDC.e | `0xF242275d3a6527d877f2c927a82D9b057609cc71` |
| Lisk Mainnet | IDRX | `0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22` |

Token addresses from [Lisk docs](https://docs.lisk.com/about-lisk/deployed-tokens).

## Features

| Feature | Status | Implementation |
|---------|--------|----------------|
| Payment Links | ✅ | `/pay?to=0x...&amount=100&currency=IDR` |
| QR Codes | ✅ | `qrcode.react` with WhatsApp share |
| Live FX Rates | ✅ | `open.er-api.com` with fallback chain |
| EIP-712 Quotes | ✅ | 5-min validity, nonce replay protection |
| On-ramp | ✅ | Onramper widget (PHP/MYR/VND → USDC) |
| Bridge | ✅ | Superbridge links (Base → Lisk) |
| Merchant Stats | ✅ | Real-time from Blockscout |

## API

### `GET /api/quote`

```typescript
// Request
{
  tokenIn: "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83",  // USDC.e
  tokenOut: "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661", // IDRX
  amountIn: "1000000",  // 1 USDC (6 decimals)
  recipient: "0x...",
  symbol: "IDR",
  chainId: 4202
}

// Response
{
  success: true,
  data: {
    quote: {
      tokenIn, tokenOut, amountIn, amountOut,
      recipient, nonce, deadline
    },
    signature: "0x...",
    rate: { rate: 15850, source: "open.er-api.com" },
    router: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  }
}
```

### `GET /api/rates`

```typescript
// Request: /api/rates?currency=IDR
// Response
{
  success: true,
  data: {
    rate: 15850.25,
    source: "open.er-api.com",
    timestamp: 1704556800000
  }
}
```

### `POST /api/webhooks/onramper`

Receives transaction events from Onramper (completed/failed/pending).

## Setup

```bash
git clone https://github.com/edwardtay/currenSEA.git
cd currenSEA/apps/web
cp ../../private/.env.example .env.local
# Edit .env.local with your keys
npm install && npm run dev
```

### Environment

```env
# Required
DEALER_PRIVATE_KEY=0x...              # EIP-712 signing
NEXT_PUBLIC_ONRAMPER_API_KEY=pk_...   # On-ramp widget

# Optional
DEALER_SPREAD_BPS=50                  # 0.5% spread
QUOTE_VALIDITY_SECONDS=300            # 5 min quotes
```

## On-Ramp Flow

Lisk isn't directly supported by fiat on-ramps. Flow:

```
Fiat (PHP/MYR/VND) 
    → Onramper/Transak 
    → USDC on Base 
    → Superbridge 
    → USDC on Lisk 
    → currenSEA Router 
    → IDRX to merchant
```

| Currency | On-ramp | Bridge | Swap |
|----------|---------|--------|------|
| PHP | ✅ Onramper | Superbridge | USDC→IDRX |
| MYR | ✅ Onramper | Superbridge | USDC→IDRX |
| VND | ✅ Onramper | Superbridge | USDC→IDRX |
| IDR | ❌ Manual | Superbridge | USDC→IDRX |
| THB | ❌ Manual | Superbridge | USDC→IDRX |
| SGD | ❌ Manual | Superbridge | USDC→IDRX |

## Security

- **Non-custodial**: Router never holds funds beyond atomic tx
- **EIP-712**: Human-readable, phishing-resistant signatures
- **Nonce tracking**: Prevents quote replay
- **Deadline enforcement**: Stale quotes rejected on-chain
- **No hardcoded keys**: All secrets via env vars

## Tech

| Component | Tech |
|-----------|------|
| Network | Lisk L2 (OP Stack, 4202/1135) |
| Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Frontend | Next.js 16, React 19, TailwindCSS v4 |
| Web3 | Wagmi v3, Viem, RainbowKit |
| FX | open.er-api.com (free, no key) |

## License

MIT — Built for Lisk Builders Challenge Round 3
