"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http, cookieStorage, createStorage, State } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { RainbowKitProvider, darkTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect, useMemo } from "react";
import { ChristmasBanner } from "./christmas-banner";

const TESTNET_STORAGE_KEY = "claimable-testnet-mode";

function getInitialTestnetMode(): boolean {
  // Server-side: return false
  if (typeof window === "undefined") return false;

  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const testnetParam = urlParams.get("testnet");

  if (testnetParam === "true") {
    // Store in localStorage for persistence
    localStorage.setItem(TESTNET_STORAGE_KEY, "true");
    return true;
  }

  if (testnetParam === "false") {
    // Explicitly disable testnet mode
    localStorage.removeItem(TESTNET_STORAGE_KEY);
    return false;
  }

  // Fall back to localStorage
  return localStorage.getItem(TESTNET_STORAGE_KEY) === "true";
}

// Create configs with connectors (client-side only)
function createWagmiConfigs() {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  const arbitrumRpc = alchemyKey 
    ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : undefined;

  const arbitrumSepoliaRpc = alchemyKey
    ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`
    : undefined;

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

  const storage = createStorage({
    storage: cookieStorage,
    key: "claimable-wagmi",
  });

  const mainnetConfig = createConfig({
    connectors,
    chains: [arbitrum],
    transports: {
      [arbitrum.id]: http(arbitrumRpc),
    },
    ssr: true,
    storage,
  });

  const testnetConfig = createConfig({
    connectors,
    chains: [arbitrum, arbitrumSepolia],
    transports: {
      [arbitrum.id]: http(arbitrumRpc),
      [arbitrumSepolia.id]: http(arbitrumSepoliaRpc),
    },
    ssr: true,
    storage,
  });

  return { mainnetConfig, testnetConfig };
}

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

  const [testnetEnabled, setTestnetEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Create configs once on client-side mount
  const { mainnetConfig, testnetConfig } = useMemo(() => createWagmiConfigs(), []);

  useEffect(() => {
    setTestnetEnabled(getInitialTestnetMode());
    setMounted(true);
  }, []);

  // Use mainnet config during SSR and initial render
  const config = mounted && testnetEnabled ? testnetConfig : mainnetConfig;

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#10B981",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          <ChristmasBanner />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
