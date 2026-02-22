# Lockd — Deployment Guide

This document is the single source of truth for all contract deployments. Update it after every deployment.

---

## Deployment Status

### Arbitrum Sepolia (Testnet) — Chain ID 421614

| Contract | Address | Status | Verified | Deployed |
|----------|---------|--------|----------|----------|
| ExclusiveClaim | `0x3bBDFD1b7Dc6bA94E0a7aBfE8A5eEc0BEe436019` | Deployed | Yes | — |
| CryptoInheritance | — | Not deployed | — | — |
| FileCertification | — | Not deployed | — | — |

### Arbitrum (Mainnet) — Chain ID 42161

| Contract | Address | Status | Verified | Deployed |
|----------|---------|--------|----------|----------|
| ExclusiveClaim | `0x9084ee38a07Ff5DD38a07a3023a0A5baAeafC22B` | Deployed | Pending | 2026-02-22 |
| CryptoInheritance | `0x33cc40c2a817fb59f9a83D6D69Aa692f1406283F` | Deployed | Pending | 2026-02-22 |
| FileCertification | `0xA3a78E0351c33973Cd4941Eb66e64dC95728265b` | Deployed | Pending | 2026-02-22 |

> Update this table after every deployment. Include the date and the block explorer link.

---

## Contracts Overview

| Contract | Solidity File | Constructor Args | Has Dependencies |
|----------|--------------|-----------------|------------------|
| ExclusiveClaim | `contracts/ExclusiveClaim.sol` | None | No |
| CryptoInheritance | `contracts/CryptoInheritance.sol` | None | No (standalone, inherits ExclusiveClaim at code level only) |
| FileCertification | `contracts/FileCertification.sol` | None | No |

All three contracts are independent on-chain. They share no state and can be deployed in any order. `CryptoInheritance` inherits from `ExclusiveClaim` in Solidity (code inheritance), but each is deployed as its own standalone contract.

---

## Prerequisites

### Required

- Node.js >= 18.0.0
- npm dependencies installed (`npm install`)
- Contracts compiled (`npm run compile`)
- All tests passing (`npm run test`)
- 100% test coverage verified (`npm run coverage`)

### Authentication (choose one)

**Option A: Ledger Hardware Wallet (recommended for mainnet)**

```bash
# Set in .env at project root
LEDGER_ACCOUNT=0xYourLedgerAddress
```

The deploy script automatically searches common derivation paths to find your address on the Ledger. Make sure the Ethereum app is open on your device.

**Option B: Private Key (testnet only)**

```bash
# Set in .env at project root
PRIVATE_KEY=0xYourPrivateKey
```

Never use a private key with real funds for mainnet deployments. Use a Ledger.

### Network Configuration

```bash
# Set in .env at project root
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc           # Mainnet (default: public RPC)
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc  # Testnet (default: public RPC)
ARBISCAN_API_KEY=your_arbiscan_api_key                   # For contract verification
```

Get an Arbiscan API key at [https://arbiscan.io/myapikey](https://arbiscan.io/myapikey).

---

## Deployment Order

All contracts are independent — deploy in any order. Recommended order for a fresh deployment:

1. **ExclusiveClaim** — Core product, most tested, deploy first to validate the process
2. **FileCertification** — Simplest contract, quick to verify
3. **CryptoInheritance** — Most complex, deploy last

---

## Step-by-Step Deployment

### 1. Pre-Deployment Checks

```bash
# Compile contracts
npm run compile

# Run all tests (must be 90+ passing)
npm run test

# Run coverage (must be 100%)
npm run coverage

# Run security linting
npm run audit:solhint
```

All checks must pass before deploying.

### 2. Deploy ExclusiveClaim

The current deploy script (`scripts/deploy.ts`) deploys ExclusiveClaim.

```bash
# Testnet
npm run deploy:arbitrum-sepolia

# Mainnet
npm run deploy:arbitrum
```

The script will:
1. Connect to the network
2. Display deployer address and balance
3. Deploy the contract
4. Wait for confirmation
5. Verify on Arbiscan (requires `ARBISCAN_API_KEY`)
6. Verify on Sourcify (no key needed)
7. Print the deployment summary

**Save the contract address from the output.**

### 3. Deploy CryptoInheritance

> The deploy script currently only deploys ExclusiveClaim. Before deploying CryptoInheritance, update `scripts/deploy.ts` to deploy the correct contract:
>
> Change `"ExclusiveClaim"` to `"CryptoInheritance"` in `ethers.getContractFactory()` and update the console logs.

```bash
# Testnet
npm run deploy:arbitrum-sepolia

# Mainnet
npm run deploy:arbitrum
```

**Save the contract address from the output.**

### 4. Deploy FileCertification

> Same process: update `scripts/deploy.ts` to deploy `"FileCertification"` and update the console logs.

```bash
# Testnet
npm run deploy:arbitrum-sepolia

# Mainnet
npm run deploy:arbitrum
```

**Save the contract address from the output.**

---

## Post-Deployment Checklist

After deploying each contract, complete every step:

### 1. Verify Contract on Block Explorer

The deploy script attempts auto-verification. If it fails, verify manually:

```bash
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS>
# or
npx hardhat verify --network arbitrum <CONTRACT_ADDRESS>
```

Verify on:
- **Arbiscan**: [https://arbiscan.io](https://arbiscan.io) (mainnet) or [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io) (testnet)
- **Sourcify**: Automatic via Hardhat config

### 2. Update Environment Variables

Add the deployed address to `apps/web/.env.local` (and `.env.production` for production):

**ExclusiveClaim:**
```bash
NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA=0xDeployedAddress
NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM=0xDeployedAddress
```

**CryptoInheritance:**
```bash
NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM_SEPOLIA=0xDeployedAddress
NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM=0xDeployedAddress
```

**FileCertification:**
```bash
NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM_SEPOLIA=0xDeployedAddress
NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM=0xDeployedAddress
```

### 3. Update This File

Come back to this file and update the **Deployment Status** tables at the top with:
- The contract address
- The deployment date
- Mark as "Deployed" and "Verified"

### 4. Test on Frontend

```bash
npm run dev
```

For each deployed contract, verify:
- [ ] Contract address resolves correctly for the chain
- [ ] Read functions work (e.g., `depositCount` returns 0 for fresh contracts)
- [ ] Write functions work (create a test deposit, certify a test hash)
- [ ] Error handling works (try invalid inputs, wrong network)

### 5. Build and Deploy Frontend

```bash
npm run build
```

Ensure the build passes with the new contract addresses.

---

## Network Details

### Arbitrum (Mainnet)

| Property | Value |
|----------|-------|
| Chain ID | 42161 |
| RPC | `https://arb1.arbitrum.io/rpc` |
| Block Explorer | [https://arbiscan.io](https://arbiscan.io) |
| Native Token | ETH |
| Gas Token | ETH (L2 fees, significantly cheaper than L1) |

### Arbitrum Sepolia (Testnet)

| Property | Value |
|----------|-------|
| Chain ID | 421614 |
| RPC | `https://sepolia-rollup.arbitrum.io/rpc` |
| Block Explorer | [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io) |
| Faucet | [https://faucet.quicknode.com/arbitrum/sepolia](https://faucet.quicknode.com/arbitrum/sepolia) |
| Native Token | ETH (testnet) |

---

## Common Token Addresses (Arbitrum Mainnet)

These are used in the frontend for the token selector:

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 |
| USDT | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | 6 |
| WETH | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` | 18 |
| ARB | `0x912CE59144191C1204E64559FE8253a0e49E6548` | 18 |

---

## Compiler Settings

These must match exactly for verification to succeed:

| Setting | Value |
|---------|-------|
| Solidity | 0.8.24 |
| Optimizer | Enabled, 200 runs |
| viaIR | true |
| EVM Version | Default (Shanghai) |

These are configured in `hardhat.config.ts`. Do not change them between deployments — the bytecode must match for verification.

---

## Troubleshooting

### "Contract verification failed"

- Ensure `ARBISCAN_API_KEY` is set in `.env`
- Wait 30-60 seconds after deployment before verifying (block propagation)
- Try manual verification: `npx hardhat verify --network <network> <address>`
- Check that compiler settings match exactly (viaIR, optimizer runs)

### "No signer available"

- Set either `PRIVATE_KEY` or `LEDGER_ACCOUNT` in `.env`
- If using Ledger, make sure the Ethereum app is open and the device is unlocked

### "Ledger address not found"

- The deploy script searches common derivation paths
- Make sure the address in `LEDGER_ACCOUNT` matches an account on your Ledger
- Try opening the Ethereum app fresh and re-running

### "Insufficient funds"

- Check deployer balance: the script prints it before deployment
- For testnet, use the [Arbitrum Sepolia faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- For mainnet, ensure enough ETH for gas (typically < 0.01 ETH per contract)

### "Stack too deep" compile error

- `viaIR: true` is required in `hardhat.config.ts` for `CryptoInheritance.sol`
- This is already configured — do not remove it

---

## Future: Multi-Chain Deployment

When expanding to additional chains, for each new chain:

1. Add network config to `hardhat.config.ts`
2. Add chain to `apps/web/src/lib/wagmi.ts`
3. Add contract addresses to `apps/web/src/lib/contracts.ts`
4. Add environment variables to `apps/web/.env.example`
5. Add token addresses for the chain to `TOKENS` in `contracts.ts`
6. Deploy, verify, and update this file
7. Test the full flow on the new chain

Candidate chains (from `package.json` scripts):
- Base
- Optimism
- Polygon
- Ethereum mainnet
