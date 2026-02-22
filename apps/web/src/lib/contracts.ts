import { Address, zeroAddress } from "viem";

// ============ ExclusiveClaim (Simple Escrow) ============

// Contract addresses per chain (Arbitrum only)
// SECURITY: These must be updated with actual deployed contract addresses before production use
// Set via environment variables: NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM and NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA
export const CLAIMABLE_ADDRESSES: Record<number, Address> = {
  42161: (process.env.NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM as Address) || zeroAddress, // Arbitrum
  421614: (process.env.NEXT_PUBLIC_CLAIMABLE_ADDRESS_ARBITRUM_SEPOLIA as Address) || zeroAddress, // Arbitrum Sepolia
};

// ============ CryptoInheritance ============

// CryptoInheritance contract addresses per chain
// Set via environment variables: NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM and NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM_SEPOLIA
export const INHERITANCE_ADDRESSES: Record<number, Address> = {
  42161: (process.env.NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM as Address) || zeroAddress, // Arbitrum
  421614: (process.env.NEXT_PUBLIC_INHERITANCE_ADDRESS_ARBITRUM_SEPOLIA as Address) || zeroAddress, // Arbitrum Sepolia
};

// ============ FileCertification ============

// FileCertification contract addresses per chain
// Set via environment variables: NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM and NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM_SEPOLIA
export const CERTIFICATION_ADDRESSES: Record<number, Address> = {
  42161: (process.env.NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM as Address) || zeroAddress, // Arbitrum
  421614: (process.env.NEXT_PUBLIC_CERTIFICATION_ADDRESS_ARBITRUM_SEPOLIA as Address) || zeroAddress, // Arbitrum Sepolia
};

/**
 * Validates that a contract address is properly configured (not zero address)
 * @param address The contract address to validate
 * @returns true if the address is valid and not the zero address
 */
export function isValidContractAddress(address: Address | undefined): address is Address {
  return !!address && address !== zeroAddress;
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
      { name: "startTime", type: "uint256" },
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
      { name: "startTime", type: "uint256" },
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
      { name: "startTime", type: "uint256" },
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
      { indexed: false, name: "startTime", type: "uint256" },
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

// ============ CryptoInheritance ABI ============

export const INHERITANCE_ABI = [
  // depositETH
  {
    inputs: [
      { name: "claimant", type: "address" },
      { name: "startTime", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "claimSecretHash", type: "bytes32" },
    ],
    name: "depositETH",
    outputs: [{ name: "depositId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  // depositToken
  {
    inputs: [
      { name: "claimant", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "claimSecretHash", type: "bytes32" },
    ],
    name: "depositToken",
    outputs: [{ name: "depositId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // batchDepositETH
  {
    inputs: [
      { name: "claimants", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "startTime", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
      { name: "contentHash", type: "bytes32" },
    ],
    name: "batchDepositETH",
    outputs: [{ name: "depositIds", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
  // batchDepositToken
  {
    inputs: [
      { name: "claimants", type: "address[]" },
      { name: "token", type: "address" },
      { name: "amounts", type: "uint256[]" },
      { name: "startTime", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
      { name: "contentHash", type: "bytes32" },
    ],
    name: "batchDepositToken",
    outputs: [{ name: "depositIds", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // claim (address-based)
  {
    inputs: [{ name: "depositId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // claimWithSecret
  {
    inputs: [
      { name: "depositId", type: "uint256" },
      { name: "secret", type: "string" },
    ],
    name: "claimWithSecret",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // refund
  {
    inputs: [{ name: "depositId", type: "uint256" }],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // extendDeadline
  {
    inputs: [
      { name: "depositId", type: "uint256" },
      { name: "newDeadline", type: "uint256" },
    ],
    name: "extendDeadline",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // batchExtendDeadline
  {
    inputs: [
      { name: "depositIds", type: "uint256[]" },
      { name: "newDeadline", type: "uint256" },
    ],
    name: "batchExtendDeadline",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // getDeposit
  {
    inputs: [{ name: "depositId", type: "uint256" }],
    name: "getDeposit",
    outputs: [
      { name: "depositor", type: "address" },
      { name: "claimant", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "claimed", type: "bool" },
      { name: "title", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "claimSecretHash", type: "bytes32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // depositCount
  {
    inputs: [],
    name: "depositCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "depositId", type: "uint256" },
      { indexed: true, name: "depositor", type: "address" },
      { indexed: true, name: "claimant", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "startTime", type: "uint256" },
      { indexed: false, name: "deadline", type: "uint256" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "contentHash", type: "bytes32" },
      { indexed: false, name: "claimSecretHash", type: "bytes32" },
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
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "depositId", type: "uint256" },
      { indexed: false, name: "oldDeadline", type: "uint256" },
      { indexed: false, name: "newDeadline", type: "uint256" },
    ],
    name: "DeadlineExtended",
    type: "event",
  },
] as const;

// ============ FileCertification ABI ============

export const CERTIFICATION_ABI = [
  // certify
  {
    inputs: [{ name: "contentHash", type: "bytes32" }],
    name: "certify",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // isCertified
  {
    inputs: [{ name: "contentHash", type: "bytes32" }],
    name: "isCertified",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // getCertification
  {
    inputs: [{ name: "contentHash", type: "bytes32" }],
    name: "getCertification",
    outputs: [
      { name: "certifier", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // getHashesByCertifier
  {
    inputs: [{ name: "certifier", type: "address" }],
    name: "getHashesByCertifier",
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  // getCertifierHashCount
  {
    inputs: [{ name: "certifier", type: "address" }],
    name: "getCertifierHashCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // certificationCount
  {
    inputs: [],
    name: "certificationCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // certifications mapping
  {
    inputs: [{ name: "", type: "bytes32" }],
    name: "certifications",
    outputs: [
      { name: "certifier", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Certified event
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "contentHash", type: "bytes32" },
      { indexed: true, name: "certifier", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "Certified",
    type: "event",
  },
] as const;
