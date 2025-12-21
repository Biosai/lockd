import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";

// Build RPC URLs with Alchemy if available (works on both server and client)
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const arbitrumRpc = alchemyKey 
  ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
  : undefined;

const arbitrumSepoliaRpc = alchemyKey
  ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : undefined;

// Storage configuration for persisting wallet connection (SSR compatible)
const storage = createStorage({
  storage: cookieStorage,
  key: "claimable-wagmi",
});

// SSR-safe config (used only for cookieToInitialState on server)
// This config doesn't include connectors as they're client-only
export const mainnetConfig = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(arbitrumRpc),
  },
  ssr: true,
  storage,
});

// SSR-safe testnet config
export const testnetConfig = createConfig({
  chains: [arbitrum, arbitrumSepolia],
  transports: {
    [arbitrum.id]: http(arbitrumRpc),
    [arbitrumSepolia.id]: http(arbitrumSepoliaRpc),
  },
  ssr: true,
  storage,
});

// Helper to get the appropriate config
export function getWagmiConfig(testnetEnabled: boolean) {
  return testnetEnabled ? testnetConfig : mainnetConfig;
}

// Default export for backwards compatibility
export const config = mainnetConfig;
