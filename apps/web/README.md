# SEAbucks

### Cross-Border Payments, Localized.

SEAbucks is a decentralized payment gateway engineered to eliminate the friction of cross-border transactions for Southeast Asian merchants. By leveraging the Lisk network's efficiency and EVM compatibility, SEAbucks allows merchants to accept stablecoin payments (USDC) from anywhere in the world while automatically receiving settlements in their preferred local currency (IDR, THB, VND, PHP, MYR, SGD).

## The Problem
Micro-merchants and SMEs in Southeast Asia face significant hurdles in accepting global payments:
*   **High Fees:** Traditional payment rails (SWIFT, Credit Cards) charge 3-7% per transaction.
*   **Settlement Delays:** Funds often take 3-5 days to clear.
*   **Currency Risk:** Volatility exposure when holding foreign currencies.
*   **Complexity:** High barrier to entry for setting up merchant accounts.

## The Solution
SEAbucks provides a "zero-setup" payment infrastructure:
1.  **Universal Acceptance:** Merchants generate a simple payment link to accept USDC.
2.  **Auto-Swap Engine:** Smart contracts automatically route incoming USDC through a DEX aggregator to swap for local currency stablecoins (e.g., IDR).
3.  **Instant Settlement:** Merchants receive the localized value directly in their wallet within seconds.
4.  **Low Friction:** No KYC, no bank account required for the initial layer—just a wallet.

## Core Features/Architecture
*   **Smart Payment Portal:** A custom Solidity contract (`PaymentPortal.sol`) that orchestrates the payment logic, fee collection (configurable), and swap routing.
*   **Atomic Swaps:** Integrates with a decentralized router to perform atomic swaps `USDC -> [Local Token]` in the same transaction as the payment.
*   **Stateless Payment Links:** Utilizes URL parameters to encode payment details (Recipient, Amount, Currency), eliminating the need for a database and allowing for decentralized sharing.
*   **Minimalist UI:** A highly refined, localized interface built with Next.js and TailwindCSS, designed for speed and ease of use on mobile devices.

## Technical Stack
*   **Network:** Lisk Sepolia (Testnet) / Lisk Mainnet
*   **Contracts:** Solidity v0.8.28, Hardhat
*   **Frontend:** Next.js 16 (App Router), Wagmi v3, Viem, TailwindCSS v4
*   **Indexing:** The Graph (Planned) / Blockscout API

## Development & Deployment

### Prerequisites
*   Node.js v20+
*   Wallet with Lisk native tokens for gas.

### Installation

```bash
git clone https://github.com/edwardtay/SEAbucks.git
cd SEAbucks

# Install dependencies
npm install
```

### Local Development

```bash
# Start the frontend
cd apps/web
npm run dev
```

### Smart Contracts

```bash
cd packages/contracts

# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy
npx hardhat run scripts/deploy.ts --network lisk-sepolia
```

## Security
*   **Non-Custodial:** The platform never takes custody of funds. Swaps and transfers occur atomically.
*   **Verified Contracts:** All smart contracts are verified on Blockscout for transparency.
*   **Audit Status:** Internal audit completed.

## License
MIT
