import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const arbitrumRpc = alchemyKey
  ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
  : "https://arb1.arbitrum.io/rpc";

export const arbitrumSepoliaRpc = alchemyKey
  ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : "https://sepolia-rollup.arbitrum.io/rpc";

const storage = createStorage({
  storage: cookieStorage,
  key: "claimable-wagmi",
});

// SSR-safe config used for cookieToInitialState on server
export const mainnetConfig = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(arbitrumRpc),
  },
  ssr: true,
  storage,
});
