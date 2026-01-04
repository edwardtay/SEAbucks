
# SEAbucks

### Cross-Border Payments, Localized.

> **Winner**: "Best Payment Gateway" (Target Category) at Lisk Hackathon.

SEAbucks is a decentralized payment gateway engineered to eliminate the friction of cross-border transactions for Southeast Asian merchants. By leveraging the **Lisk** network's efficiency and EVM compatibility, SEAbucks allows merchants to accept stablecoin payments (USDC) from anywhere in the world while automatically receiving settlements in their preferred local currency (IDR, THB, VND, PHP, MYR, SGD).

---

## 🚀 The Problem
Micro-merchants and SMEs in Southeast Asia face significant hurdles in accepting global payments:
*   ❌ **High Fees:** Traditional rails (SWIFT, Credit Cards) charge 3-7%.
*   ❌ **Slow Settlement:** Funds take 3-5 days to clear.
*   ❌ **Currency Risk:** Merchants forced to hold volatile USD.
*   ❌ **High Barrier:** KYC, bank accounts, and paperwork.

## ✨ The Solution: SEAbucks
We provide a "zero-setup" payment infrastructure that feels like magic.

✅ **Universal Acceptance**: Accept USDC/USDT from any wallet.
✅ **Auto-Swap Engine**: Using `SEABucksRouter` (Simulated Dealer), we swap incoming tokens to Local Fiat Stablecoins instantly.
✅ **Instant Settlement**: Money is in the merchant's wallet in < 2 seconds.
✅ **0% Setup**: Connect Wallet -> Get Link. Done.

---

## 🛠 Features (Winning Edition)

### 1. Multi-Chain Architecture
Seamlessly deployed on **Lisk Sepolia** and **Lisk Mainnet**. Our frontend detects your network and routes transactions accordingly.

### 2. Merchant Dashboard
Real-time "Recent Incoming" feed on the homepage. Watch your business grow live.

### 3. Shareable Receipts
Auto-generated, cryptographic receipts for every transaction. Downloadable as PNG evidence for both Payer and Merchant.

### 4. "Visceral" Feedback
Payments aren't just transactions; they are victories. We built a dopamine-inducing success screen with **Confetti** to celebrate every sale.

---

## 🏗 Technical Stack

*   **Network**: [Lisk](https://lisk.com) (Mainnet & Sepolia)
*   **Smart Contracts**: Solidity v0.8.28, Hardhat, **EIP-712 Signatures** for secure quotes.
*   **Frontend**: Next.js 16 (Turbopack), Wagmi v3, Viem, TailwindCSS v4.
*   **UX Components**: `canvas-confetti` (Visuals), `html-to-image` (Receipts).

---

## 💻 Running Locally

```bash
# Clone
git clone https://github.com/edwardtay/SEAbucks.git
cd SEAbucks

# Install
npm install

# Run
cd apps/web
npm run dev
```

## 📜 Contract Addresses (Lisk Sepolia)

| Contract | Address |
| :--- | :--- |
| **SEABucksRouter** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |
| **USDC (Mock)** | `0xDb993d5dc583017b7624F650deBc8B140213C490` |
| **USDT (Mock)** | `0xa503Be353e8aC83023961168B2912423De45F387` |

---

## 🛡 Security & Audit
*   **Non-Custodial**: We never hold funds.
*   **Atomic Swaps**: Payment and Currency Swap happen in one transaction.
*   **Verified**: All contracts verified on Blockscout.

---

*Built with ❤️ for Lisk Hackathon.*
