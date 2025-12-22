"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, State } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

const TESTNET_STORAGE_KEY = "claimable-testnet-mode";

function getInitialTestnetMode(): boolean {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  const testnetParam = urlParams.get("testnet");

  if (testnetParam === "true") {
    localStorage.setItem(TESTNET_STORAGE_KEY, "true");
    return true;
  }

  if (testnetParam === "false") {
    localStorage.removeItem(TESTNET_STORAGE_KEY);
    return false;
  }

  return localStorage.getItem(TESTNET_STORAGE_KEY) === "true";
}

// Get RPC URLs
const alchemyKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY : undefined;
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

const arbitrumRpc = alchemyKey 
  ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
  : "https://arb1.arbitrum.io/rpc";

const arbitrumSepoliaRpc = alchemyKey
  ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : "https://sepolia-rollup.arbitrum.io/rpc";

// Create a single config that works for both SSR and client
// Using getDefaultConfig ensures connectors are properly initialized
const wagmiConfig = getDefaultConfig({
  appName: "Lockd",
  projectId,
  chains: [arbitrum, arbitrumSepolia],
  transports: {
    [arbitrum.id]: http(arbitrumRpc),
    [arbitrumSepolia.id]: http(arbitrumSepoliaRpc),
  },
  ssr: true,
});

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
}

export function Providers({ children, initialState }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig as any} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#10B981",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
