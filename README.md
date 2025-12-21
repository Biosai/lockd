# Lokd

<div align="center">

**Lock crypto for anyone. Get it back if unclaimed.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org)

[Website](https://lokd.xyz) · [Documentation](#documentation) · [Contributing](CONTRIBUTING.md)

</div>

---

## Overview

Lokd is an open-source, trustless conditional escrow protocol. Lock crypto for a recipient with automatic refund protection. No middleman, purely on-chain.

### How It Works

```
┌──────────────┐       lock()       ┌──────────────────┐
│    Sender    │ ─────────────────► │       Lokd       │
└──────────────┘                    └──────────────────┘
                                            │
                 ┌──────────────────────────┼──────────────────────────┐
                 │                          │                          │
                 ▼                          ▼                          ▼
         Before Deadline            After Deadline              After Deadline
         ┌───────────┐              ┌───────────┐              ┌───────────┐
         │ Recipient │              │ Recipient │              │  Sender   │
         │   claim() │              │   claim() │              │  refund() │
         └───────────┘              └───────────┘              └───────────┘
```

1. **Lock Funds** - Lock ETH or any ERC20 token for a specific recipient
2. **Share the Link** - Send the claim link to your recipient
3. **Claim or Refund** - Recipient claims the funds, or you reclaim after the deadline

## Features

- **Trustless** - No middleman, purely on-chain smart contracts
- **Protected** - Automatic refund if unclaimed after deadline
- **Multi-Token** - Supports ETH and any ERC20 token
- **Gas Efficient** - Optimized for minimal transaction costs
- **Open Source** - MIT licensed, fully auditable

## Use Cases

| Use Case | Description |
|----------|-------------|
| **Freelance Payments** | Lock payment for work. Claim when delivered, refund if not. |
| **Bounties & Rewards** | Lock rewards for contributors. Assign upon completion. |
| **P2P Offers** | Make trustless offers for NFTs or services. |
| **Crypto Gifts** | Send gifts that can be reclaimed if not accepted. |
| **Invoice Payments** | Create invoice links. Claim upon service delivery. |

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lokd.git
cd lokd

# Install dependencies
npm install
```

### Development

```bash
# Run the web app
npm run dev

# Run contract tests
npm run test:contracts

# Compile contracts
npm run compile
```

### Deployment

```bash
# Deploy to Arbitrum Sepolia (testnet)
npm run deploy:arbitrum-sepolia

# Deploy to Arbitrum (mainnet)
npm run deploy:arbitrum
```

## Project Structure

```
lokd/
├── apps/
│   └── web/                # Next.js web application
│       ├── src/
│       │   ├── app/        # Next.js app router pages
│       │   ├── components/ # React components
│       │   └── lib/        # Utilities and contract ABIs
├── packages/
│   └── contracts/          # Solidity smart contracts
│       ├── contracts/      # Contract source files
│       ├── test/           # Contract tests (Hardhat)
│       └── scripts/        # Deployment scripts
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Documentation

### Smart Contract

The `Claimable` contract provides the following functions:

#### `depositETH(address claimant, uint256 deadline)`

Lock ETH for a specific recipient.

```solidity
// Lock 1 ETH for recipient, claimable for 24 hours
claimable.depositETH{value: 1 ether}(recipientAddress, block.timestamp + 86400);
```

#### `depositToken(address claimant, address token, uint256 amount, uint256 deadline)`

Lock ERC20 tokens. Requires prior approval.

```solidity
// Approve tokens first
IERC20(tokenAddress).approve(claimableAddress, amount);

// Lock tokens
claimable.depositToken(recipientAddress, tokenAddress, amount, block.timestamp + 86400);
```

#### `claim(uint256 depositId)`

Claim locked funds (only callable by the designated recipient).

```solidity
claimable.claim(depositId);
```

#### `refund(uint256 depositId)`

Refund locked funds (only callable by sender, after deadline).

```solidity
claimable.refund(depositId);
```

### Contract Addresses

| Network | Address |
|---------|---------|
| Arbitrum | `TBD` |
| Arbitrum Sepolia | `TBD` |
| Ethereum | `TBD` |
| Sepolia | `TBD` |

## Tech Stack

### Web Application

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Web3**: wagmi v2 + viem
- **Wallet**: RainbowKit
- **Animations**: Framer Motion

### Smart Contracts

- **Language**: Solidity 0.8.24
- **Framework**: Hardhat
- **Testing**: Chai + Hardhat Network Helpers
- **Security**: OpenZeppelin Contracts

## Security

- Uses OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks
- Uses `SafeERC20` for safe token transfers
- All state changes emit events for transparency
- Comprehensive test coverage

### Audit Status

This contract has not yet been audited. Use at your own risk.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- Report bugs and suggest features
- Improve documentation
- Submit pull requests
- Share Lokd with others

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure contract libraries
- [wagmi](https://wagmi.sh/) for React hooks
- [RainbowKit](https://www.rainbowkit.com/) for wallet connection
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

<div align="center">

**Lock. Claim. Refund.**

[Website](https://lokd.xyz) · [Twitter](https://twitter.com/lokdxyz) · [GitHub](https://github.com/your-username/lokd)

</div>
