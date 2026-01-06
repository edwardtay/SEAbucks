# currenSEA

### Cross-Border Payments, Localized.

currenSEA is a decentralized payment gateway engineered to eliminate the friction of cross-border transactions for Southeast Asian merchants. By leveraging the Lisk network's efficiency and EVM compatibility, currenSEA allows merchants to accept stablecoin payments (USDC) from anywhere in the world while automatically receiving settlements in their preferred local currency (IDR, THB, VND, PHP, MYR, SGD).

## The Problem
Traditional cross-border payments in Southeast Asia are plagued by high fees (3-7%), slow settlement times (3-5 days), and complex setup requirements. Micro-merchants and SMEs are disproportionately affected.

## The Solution
currenSEA provides a "zero-setup" payment infrastructure:
1. **Universal Acceptance:** Merchants generate a simple payment link to accept USDC.
2. **Auto-Swap Engine:** Smart contracts automatically route incoming USDC through a DEX aggregator to swap for local currency stablecoins (e.g., IDRX).
3. **Instant Settlement:** Merchants receive local currency stablecoins directly in their wallet within seconds.

## Tech Stack
- **Network:** Lisk L2 (OP Stack)
- **Smart Contracts:** Solidity 0.8.28, Hardhat
- **Frontend:** Next.js 16, React 19, TailwindCSS v4
- **Web3:** Wagmi v3, Viem, RainbowKit
- **Signatures:** EIP-712 Typed Data

## Quick Start

```bash
git clone https://github.com/edwardtay/currenSEA.git
cd currenSEA

# Install dependencies
npm install

# Run development server
cd apps/web
npm run dev
```

## License
MIT
