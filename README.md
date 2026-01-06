# currenSEA

### Cross-Border Payments Infrastructure for Southeast Asia

currenSEA is a production-ready payment gateway that enables merchants in Southeast Asia to accept stablecoin payments (USDC) from anywhere in the world, with instant settlement in local currencies. Built on **Lisk L2** for near-zero fees and sub-second finality.

---

## 🎯 Problem Statement

Cross-border payments in Southeast Asia are broken:

| Issue | Traditional Rails | currenSEA |
|-------|------------------|----------|
| Fees | 3-7% (SWIFT, Cards) | 0.5% |
| Settlement | 3-5 business days | < 2 seconds |
| Currency Risk | Merchant holds USD | Auto-convert to local |
| Setup | KYC, bank accounts, paperwork | Connect wallet, done |

**Target Users:** 70M+ micro-merchants and SMEs across Indonesia, Thailand, Vietnam, Philippines, Malaysia, and Singapore.

---

## ✨ Solution

currenSEA provides **zero-setup payment infrastructure** with:

1. **Universal Acceptance** - Accept USDC/USDT from any wallet worldwide
2. **Instant FX Conversion** - Real-time USD→Local currency via signed dealer quotes
3. **Atomic Settlement** - Payment + swap in single transaction
4. **Non-Custodial** - Funds go directly to merchant wallet

---

## 🏗 Technical Architecture

### Smart Contracts (Solidity 0.8.28)

```
┌─────────────────────────────────────────────────────────────┐
│                     CurrenSEARouter                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  EIP-712 Signed Quotes (Dealer Model)               │   │
│  │  - Prevents front-running                           │   │
│  │  - Off-chain rate calculation                       │   │
│  │  - On-chain signature verification                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Atomic Swap Execution                              │   │
│  │  - Pull USDC from payer                             │   │
│  │  - Transfer local stablecoin to merchant            │   │
│  │  - Single transaction, no partial fills             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Quote API Flow

```
Payer Request → /api/quote → Fetch Live FX Rate → Calculate Spread → 
Sign EIP-712 Quote → Return to Frontend → Execute on Router Contract
```

### Key Technical Features

- **EIP-712 Typed Signatures** - Secure, human-readable quote signing
- **Real-time FX Rates** - Multi-provider redundancy (Exchange Rate API, Frankfurter, fallback)
- **Nonce-based Replay Protection** - Each quote is single-use
- **Deadline Enforcement** - Quotes expire after 5 minutes
- **Chain-aware Configuration** - Automatic Sepolia/Mainnet detection

---

## 📦 Deployed Contracts

### Lisk Sepolia (Testnet)

| Contract | Address | Verified |
|----------|---------|----------|
| CurrenSEARouter | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | ✅ |
| USDC.e (Bridged) | `0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83` | ✅ |
| IDRX | `0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661` | ✅ |

### Lisk Mainnet

| Contract | Address | Verified |
|----------|---------|----------|
| USDC.e (Bridged) | `0xF242275d3a6527d877f2c927a82D9b057609cc71` | ✅ |
| USDT | `0x05D032ac25d322df992303dCa074EE7392C117b9` | ✅ |
| IDRX | `0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22` | ✅ |

*Token addresses sourced from [Lisk Official Documentation](https://docs.lisk.com/about-lisk/deployed-tokens)*

---

## 🌏 Supported Currencies

| Currency | Country | Stablecoin | Status |
|----------|---------|------------|--------|
| IDR | Indonesia | IDRX | ✅ Live |
| PHP | Philippines | - | 🔜 Planned |
| VND | Vietnam | - | 🔜 Planned |
| THB | Thailand | - | 🔜 Planned |
| MYR | Malaysia | - | 🔜 Planned |
| SGD | Singapore | - | 🔜 Planned |

---

## 💳 On-Ramp / Off-Ramp

currenSEA integrates fiat on/off-ramp via multiple providers:

**Option 1: Onramper (Recommended - Self-serve)**
- Aggregates Transak, MoonPay, Wyre, etc.
- Sign up at https://onramper.com
- No sales team needed

**Option 2: Transak**
- Direct integration
- Sign up at https://transak.com

```
Fiat (PHP/MYR/VND) → On-ramp → USDC on Base → Superbridge → USDC on Lisk
```

**Supported Payment Methods:**
- Credit/Debit Cards (Visa, Mastercard)
- Bank Transfers
- E-wallets (GCash, Maya, Touch n Go)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Network | Lisk L2 (OP Stack) |
| Smart Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Frontend | Next.js 16, React 19, TailwindCSS v4 |
| Web3 | Wagmi v3, Viem, RainbowKit |
| Signatures | EIP-712 Typed Data |
| FX Rates | Exchange Rate API (real-time) |
| Bridge | Superbridge (OP Stack native) |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/edwardtay/currenSEA.git
cd currenSEA

# Install dependencies
npm install

# Set environment variables
cp private/.env.example private/.env
# Edit .env with your keys

# Run development server
cd apps/web
npm run dev
```

### Environment Variables

```env
# Required for production
DEALER_PRIVATE_KEY=0x...          # Quote signing key
NEXT_PUBLIC_ROUTER_ADDRESS_SEPOLIA=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# On-ramp (choose one)
NEXT_PUBLIC_ONRAMPER_API_KEY=...  # Recommended - self-serve at onramper.com
# OR
NEXT_PUBLIC_TRANSAK_API_KEY=...   # Alternative
NEXT_PUBLIC_TRANSAK_ENV=STAGING   # or PRODUCTION

# Optional
DEALER_SPREAD_BPS=50              # 0.5% spread
QUOTE_VALIDITY_SECONDS=300        # 5 minute quotes
```

---

## 📊 Hackathon Criteria Alignment

### Lisk Builders Challenge Round 3

| Criteria | Implementation |
|----------|---------------|
| **Smart Contract on Lisk** | ✅ CurrenSEARouter deployed on Sepolia |
| **Live Project URL** | ✅ Deployed on Vercel |
| **Public GitHub Repo** | ✅ Open source |
| **Real-World Venture** | ✅ Solves $48B SEA remittance market |
| **Revenue Model** | ✅ 0.5% spread on conversions |
| **Technical Depth** | ✅ EIP-712, atomic swaps, real FX rates |

### Innovation Highlights

1. **Dealer Model** - Mimics professional OTC desks, not AMM-based
2. **Real IDRX Integration** - Uses actual deployed stablecoin on Lisk
3. **Production FX Rates** - Live rates from Exchange Rate API
4. **Multi-step On-ramp** - Transak → Base → Superbridge → Lisk flow
5. **Chain-aware UI** - Automatic Sepolia/Mainnet detection

---

## 🔒 Security

- **Non-Custodial**: Contract never holds user funds beyond transaction
- **Signature Verification**: All quotes verified on-chain via ECDSA
- **Replay Protection**: Nonce increments prevent quote reuse
- **Deadline Enforcement**: Stale quotes rejected
- **Verified Contracts**: All contracts verified on Blockscout

---

## 📈 Roadmap

- [x] Core payment flow (USDC → IDRX)
- [x] EIP-712 signed quotes
- [x] Real-time FX rates
- [x] On-ramp integration (Onramper/Transak)
- [x] Bridge integration (Superbridge)
- [x] QR code payments with WhatsApp sharing
- [x] Merchant stats dashboard
- [ ] Additional SEA stablecoins (PHP, VND, THB)
- [ ] QR code standards (QRIS, PromptPay)
- [ ] Merchant SDK
- [ ] Mobile app

---

## 📄 License

MIT License - Built for Lisk Builders Challenge Round 3

---

*Built with ❤️ for Southeast Asian merchants*
