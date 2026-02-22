# Lockd

<div align="center">

**The trust layer for crypto. Lock value, guaranteed by blockchain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org)
[![Tests](https://img.shields.io/badge/Tests-90%2B%20passing-green)](test/)
[![Audit](https://img.shields.io/badge/Audit-0%20Critical-brightgreen)](reports/audit-report.md)

[Website](https://lockd.xyz) · [Documentation](#product-suite) · [Deployment](DEPLOYMENT.md) · [Audit Report](reports/audit-report.md) · [GitHub](https://github.com/Biosai/lockd)

</div>

---

## Vision

**A world where value transfer doesn't require trust in people, institutions, or intermediaries.**

Banks charge fees to hold your money. Lawyers charge fees to enforce agreements. Escrow services charge fees to sit between two parties. All of them can fail, delay, or deny. Lockd replaces all of that with deterministic smart contracts that execute exactly as programmed — transparently, instantly, and without permission from anyone.

## Mission

**Make blockchain-based value transfer accessible, safe, and programmable for everyone — starting with the three hardest trust problems in crypto: payments, inheritance, and proof of existence.**

## Why Lockd Exists

Three real problems that crypto hasn't solved yet:

| Problem | Reality Today | Lockd's Answer |
|---------|--------------|----------------|
| **Paying someone you don't fully trust** | Send crypto and hope they deliver. No recourse if they don't. | Lock funds with a deadline. Recipient claims on delivery. Auto-refund if unclaimed. |
| **Passing crypto to your family** | Write seed phrases on paper. Hope your family finds them. Hope they know what to do. | Dead man's switch inheritance. Check in periodically. If you stop, assets go to the right people automatically. |
| **Proving a file existed at a point in time** | Trusted timestamps cost money, require third parties, and can be disputed. | Hash your file locally. Store the hash on-chain. Immutable, instant, verifiable forever. |

---

## Product Suite

Lockd is a protocol with three products, each solving a distinct trust problem. All products are non-custodial, fully on-chain, and open source.

### 1. Lockd Payments (`ExclusiveClaim.sol`)

Trustless escrow with automatic refund protection.

```
Sender locks funds → Recipient claims → OR → Sender refunds after deadline
```

- Lock ETH or any ERC20 token for a specific wallet address
- Recipient can claim at any time by connecting their wallet
- After the deadline, sender can reclaim 100% of the funds
- Optional title/message for context (e.g., "Logo design payment")
- Optional delayed start time (funds become claimable only after a specific date)
- Supports fee-on-transfer tokens (records actual received amount)
- **No fees. No middleman. No platform risk.**

**Use cases**: Freelance payments, bounties, P2P offers, crypto gifts, invoice payments, escrow agreements.

### 2. Lockd Inheritance (`CryptoInheritance.sol`)

Crypto inheritance with a dead man's switch.

```
Owner deposits → Checks in periodically → Stops checking in → Beneficiaries claim
```

- Everything in Lockd Payments, plus:
- **Dead man's switch**: Extend deadline periodically to prove you're active
- **Secret-based claiming**: Beneficiaries don't need a wallet — claim with a secret phrase
- **Batch deposits**: Distribute to multiple beneficiaries in a single transaction
- **Document certification**: Attach a content hash (e.g., hash of a will) to any deposit
- **Batch deadline extension**: Extend all deposits at once during check-in

**Use cases**: Estate planning, crypto inheritance, dead man's switch, long-term conditional transfers.

### 3. Lockd Certify (`FileCertification.sol`)

On-chain proof of file existence.

```
Hash file locally → Store hash on-chain → Verify anytime
```

- Compute SHA-256 hash of any file entirely in your browser (file never leaves your device)
- Store the hash on-chain with your wallet address and block timestamp
- First-come-first-served: only the first certifier is recorded
- Anyone can verify by re-hashing the file and checking on-chain
- **Privacy-preserving**: Only the hash is stored, never the file contents

**Use cases**: Intellectual property protection, contract timestamping, evidence preservation, research priority, audit trails.

---

## Architecture

### Monorepo Structure

```
lockd/
├── contracts/                  # Solidity smart contracts
│   ├── ExclusiveClaim.sol      # Payments — trustless escrow (264 lines)
│   ├── CryptoInheritance.sol   # Inheritance — dead man's switch (567 lines)
│   ├── FileCertification.sol   # Certify — proof of existence (106 lines)
│   └── test/
│       └── MockERC20.sol       # Test helper
│
├── test/                       # Contract test suite (90+ tests)
│   ├── ExclusiveClaim.test.ts  # 38 tests — full coverage
│   ├── CryptoInheritance.test.ts # 34 tests — full coverage
│   └── FileCertification.test.ts # 18 tests — full coverage
│
├── apps/web/                   # Next.js 16 web application
│   ├── src/
│   │   ├── app/                # Pages (landing, dashboard, claim, certify, inheritance)
│   │   ├── components/         # React components (app/, certify/, ui/)
│   │   ├── lib/                # Contracts, wagmi config, utilities
│   │   └── i18n/               # Internationalization config
│   └── messages/               # Translation files (en.json, fr.json)
│
├── reports/                    # Security audit reports
│   └── audit-report.md         # Current audit (0 critical, 0 high, 0 medium)
│
├── scripts/                    # Deployment scripts
└── hardhat.config.ts           # Hardhat config (Arbitrum mainnet + testnet)
```

### Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin v5 | Industry standard. Built-in overflow protection. Battle-tested libraries. |
| **Frontend** | Next.js 16, React 19, TypeScript | App Router for performance. Server components by default. |
| **Web3** | wagmi v2, viem, RainbowKit | Type-safe contract interactions. Best wallet UX. |
| **Styling** | Tailwind CSS, Radix UI, Framer Motion | Utility-first. Accessible primitives. Smooth animations. |
| **i18n** | next-intl | Server-side rendering. Cookie-based locale. |
| **Testing** | Hardhat (Mocha/Chai), hardhat-network-helpers | Time manipulation. Balance assertions. Event testing. |
| **Security** | OpenZeppelin, ReentrancyGuard, SafeERC20 | Audited libraries. Defense in depth. |
| **Network** | Arbitrum (L2) | Low fees. Ethereum security. Fast finality. |

### Security Posture

| Control | Status |
|---------|--------|
| ReentrancyGuard on all state-changing functions | Implemented |
| SafeERC20 for all token transfers | Implemented |
| Checks-Effects-Interactions pattern | Implemented |
| Custom errors (gas-efficient reverts) | Implemented |
| Fee-on-transfer token support | Implemented |
| Input validation (zero amounts, addresses, deadlines) | Implemented |
| 90+ automated tests | Passing |
| Automated security audit (Solhint + manual review) | [Completed](reports/audit-report.md) |
| Critical/High/Medium findings | 0 |
| Professional third-party audit | Planned pre-mainnet |

---

## Current Status

### What's Live

- **Smart contracts**: All 3 contracts compiled, tested, audit-clean
- **Web app**: Full-featured UI with wallet integration, multi-language (EN/FR)
- **Network**: Deployed on Arbitrum Sepolia (testnet)
- **Testing**: 90+ tests, 100% coverage target, 0 critical audit findings

### Contract Addresses

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment status, addresses, and step-by-step deployment guide.

| Network | ExclusiveClaim | CryptoInheritance | FileCertification |
|---------|---------------|-------------------|-------------------|
| Arbitrum Sepolia | `0x3bBD...6019` | Not deployed | Not deployed |
| Arbitrum Mainnet | Not deployed | Not deployed | Not deployed |

---

## Roadmap

This is both our plan and our accountability. The repo is our single source of truth.

### Phase 1: Foundation (Current)

- [x] ExclusiveClaim contract — trustless escrow
- [x] CryptoInheritance contract — dead man's switch inheritance
- [x] FileCertification contract — proof of existence
- [x] 90+ automated tests with 100% coverage target
- [x] Security audit (automated) — 0 critical/high/medium
- [x] Next.js web app with full Web3 integration
- [x] Multi-language support (English, French)
- [x] Arbitrum Sepolia deployment
- [x] Responsive UI with dark mode

### Phase 2: Production Readiness

- [ ] Professional third-party security audit
- [ ] Arbitrum mainnet deployment
- [ ] Subgraph (The Graph) for efficient on-chain data indexing
- [ ] End-to-end integration tests (web app + contracts)
- [ ] Error monitoring and alerting (Sentry)
- [ ] Performance profiling and optimization
- [ ] Gas optimization pass (struct packing, loop optimization)

### Phase 3: Growth & Adoption

- [ ] Landing page SEO and performance optimization
- [ ] Shareable claim links with Open Graph previews
- [ ] Email/notification system for deposit events
- [ ] Multi-chain expansion (Base, Optimism, Polygon)
- [ ] ENS name resolution for recipient addresses
- [ ] Analytics dashboard (protocol-level stats)
- [ ] API for programmatic deposits (developer SDK)

### Phase 4: Protocol Evolution

- [ ] Governance token exploration
- [ ] DAO structure for protocol upgrades
- [ ] Dispute resolution mechanism
- [ ] Recurring/streaming payments
- [ ] Multi-signature deposits (N-of-M claiming)
- [ ] Mobile app (React Native or PWA)
- [ ] Additional languages (ES, DE, PT, ZH, JA)

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
git clone https://github.com/Biosai/lockd.git
cd lockd
npm install
```

### Development

```bash
# Start the web app (http://localhost:3000)
npm run dev

# Compile smart contracts
npm run compile

# Run contract tests
npm run test

# Run test coverage
npm run coverage
```

### Security Audits

```bash
# Run Solhint linting
npm run audit:solhint

# Run Slither static analysis (requires Python + slither-analyzer)
npm run audit:slither

# Full audit pipeline
npm run audit
```

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide, including pre-deployment checks, step-by-step instructions, and post-deployment verification.

```bash
# Deploy to Arbitrum Sepolia (testnet)
npm run deploy:arbitrum-sepolia

# Deploy to Arbitrum (mainnet) — requires Ledger or private key
npm run deploy:arbitrum
```

### Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=           # WalletConnect Cloud
NEXT_PUBLIC_ALCHEMY_API_KEY=                    # Alchemy (optional, has public fallback)
NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM=          # ExclusiveClaim (Lockd Payments)
NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA=  # ExclusiveClaim (testnet)
NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM=         # CryptoInheritance (Lockd Inheritance)
NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM_SEPOLIA= # CryptoInheritance (testnet)
NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM=       # FileCertification (Lockd Certify)
NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM_SEPOLIA= # FileCertification (testnet)
```

---

## Smart Contract Documentation

### ExclusiveClaim

```solidity
depositETH(address claimant, uint256 deadline, uint256 startTime, string title)
depositToken(address claimant, address token, uint256 amount, uint256 deadline, uint256 startTime, string title)
claim(uint256 depositId)
refund(uint256 depositId)
getDeposit(uint256 depositId) → Deposit
```

### CryptoInheritance

Everything in ExclusiveClaim, plus:

```solidity
claimWithSecret(uint256 depositId, string secret)
extendDeadline(uint256 depositId, uint256 newDeadline)
batchExtendDeadline(uint256[] depositIds, uint256 newDeadline)
batchDepositETH(address[] claimants, uint256 deadline, ...)
batchDepositToken(address[] claimants, address token, uint256 totalAmount, uint256 deadline, ...)
```

### FileCertification

```solidity
certify(bytes32 fileHash)
isCertified(bytes32 fileHash) → bool
getCertification(bytes32 fileHash) → (address certifier, uint256 timestamp)
getHashesByCertifier(address certifier) → bytes32[]
```

---

## Contributing

We're building in the open. Contributions are welcome.

### How to Contribute

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Write tests first (100% coverage required for contracts)
4. Make your changes
5. Run `npm run test && npm run build` to verify
6. Submit a pull request

### Code Standards

- **Solidity**: Custom errors, NatSpec docs, Checks-Effects-Interactions, ReentrancyGuard
- **TypeScript**: Strict mode, explicit types, descriptive names (no abbreviations)
- **React**: Server components by default, `"use client"` only when necessary
- **Testing**: 100% coverage for contracts, test all error paths
- **i18n**: All user-facing strings through next-intl (EN + FR minimum)

### What We're Looking For

- Bug reports and security disclosures
- Gas optimization improvements
- New language translations
- UX improvements and accessibility fixes
- Integration ideas and partnership proposals

---

## Business Context

### Revenue Model (Planned)

Lockd is currently free to use. Potential revenue paths under consideration:

- **Protocol fee**: Small percentage on claims (opt-in or tiered)
- **Premium features**: Advanced inheritance plans, priority support
- **Enterprise API**: SDK licensing for businesses integrating Lockd
- **White-label**: Custom deployments for institutions

### Competitive Landscape

| Competitor | Approach | Lockd Differentiator |
|-----------|----------|---------------------|
| Traditional escrow | Centralized, fees, slow | Trustless, instant, no fees |
| Gnosis Safe | Multi-sig wallets | Purpose-built for conditional transfers |
| Sablier | Token streaming | Deadline-based claiming, not streaming |
| Legacy.com | Centralized inheritance | Non-custodial, on-chain, no intermediary |

### Key Metrics to Track

- Total Value Locked (TVL)
- Number of deposits created
- Number of successful claims
- Number of refunds (indicates trust model working)
- File certifications created
- Unique wallet addresses
- Chain/token distribution
- Gas costs per operation

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Lock value. Guaranteed by blockchain.**

[lockd.xyz](https://lockd.xyz) · [GitHub](https://github.com/Biosai/lockd) · [Telegram](https://t.me/lockdxyz)

</div>
