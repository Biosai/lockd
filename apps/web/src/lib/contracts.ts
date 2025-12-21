import { Address, zeroAddress } from "viem";

// Contract addresses per chain (Arbitrum only)
// SECURITY: These must be updated with actual deployed contract addresses before production use
// Set via environment variables: NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM and NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA
export const CLAIMABLE_ADDRESSES: Record<number, Address> = {
  42161: (process.env.NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM as Address) || zeroAddress, // Arbitrum
  421614: (process.env.NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA as Address) || zeroAddress, // Arbitrum Sepolia
};

/**
 * Validates that a contract address is properly configured (not zero address)
 * @param address The contract address to validate
 * @returns true if the address is valid and not the zero address
 */
export function isValidContractAddress(address: Address | undefined): address is Address {
  return !!address && address !== zeroAddress;
}

/**
 * Error thrown when attempting to interact with an unconfigured contract
 */
export class ContractNotConfiguredError extends Error {
  constructor(chainId: number) {
    super(`Contract address not configured for chain ${chainId}. Please set the appropriate environment variable.`);
    this.name = "ContractNotConfiguredError";
  }
}

// Common token addresses per chain (Arbitrum only)
export const TOKENS: Record<
  number,
  Record<string, { address: Address; symbol: string; decimals: number }>
> = {
  42161: {
    ETH: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      decimals: 18,
    },
    USDC: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      symbol: "USDC",
      decimals: 6,
    },
    USDT: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      symbol: "USDT",
      decimals: 6,
    },
    WETH: {
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      symbol: "WETH",
      decimals: 18,
    },
    ARB: {
      address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      symbol: "ARB",
      decimals: 18,
    },
  },
  421614: {
    ETH: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// Claimable contract ABI (minimal for frontend interactions)
export const CLAIMABLE_ABI = [
  {
    inputs: [
      { name: "claimant", type: "address" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
    ],
    name: "depositETH",
    outputs: [{ name: "depositId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "claimant", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
    ],
    name: "depositToken",
    outputs: [{ name: "depositId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "depositId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "depositId", type: "uint256" }],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "depositId", type: "uint256" }],
    name: "getDeposit",
    outputs: [
      { name: "depositor", type: "address" },
      { name: "claimant", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "claimed", type: "bool" },
      { name: "title", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "depositCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "depositId", type: "uint256" },
      { indexed: true, name: "depositor", type: "address" },
      { indexed: true, name: "claimant", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "deadline", type: "uint256" },
      { indexed: false, name: "title", type: "string" },
    ],
    name: "DepositCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "depositId", type: "uint256" },
      { indexed: true, name: "claimant", type: "address" },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "depositId", type: "uint256" },
      { indexed: true, name: "depositor", type: "address" },
    ],
    name: "Refunded",
    type: "event",
  },
] as const;

// ERC20 ABI (minimal)
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
