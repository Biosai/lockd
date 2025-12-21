import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Claimable",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [arbitrum, arbitrumSepolia, mainnet, sepolia],
  ssr: true,
});

