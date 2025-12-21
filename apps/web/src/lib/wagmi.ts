import { createConfig, http } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet, rainbowWallet],
    },
  ],
  {
    appName: "Claimable",
    projectId,
  }
);

// Mainnet-only config (default)
export const mainnetConfig = createConfig({
  connectors,
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
  ssr: true,
});

// Config with testnet enabled (hidden feature)
export const testnetConfig = createConfig({
  connectors,
  chains: [arbitrum, arbitrumSepolia],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  ssr: true,
});

// Helper to get the appropriate config
export function getWagmiConfig(testnetEnabled: boolean) {
  return testnetEnabled ? testnetConfig : mainnetConfig;
}

// Default export for backwards compatibility
export const config = mainnetConfig;
