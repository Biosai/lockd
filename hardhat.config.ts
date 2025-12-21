import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ledger";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";

// Ledger account address (set in .env to use Ledger for signing)
const LEDGER_ACCOUNT = process.env.LEDGER_ACCOUNT || "";

// Use Ledger if LEDGER_ACCOUNT is set, otherwise use private key
const useLedger = LEDGER_ACCOUNT.length > 0;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    arbitrum: {
      url: ARBITRUM_RPC_URL,
      chainId: 42161,
      accounts: useLedger ? [] : [PRIVATE_KEY],
      ledgerAccounts: useLedger ? [LEDGER_ACCOUNT] : [],
    },
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      chainId: 421614,
      accounts: useLedger ? [] : [PRIVATE_KEY],
      ledgerAccounts: useLedger ? [LEDGER_ACCOUNT] : [],
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: ARBISCAN_API_KEY,
      arbitrumSepolia: ARBISCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;

