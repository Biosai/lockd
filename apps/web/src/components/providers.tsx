"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, State } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect, useRef } from "react";
import { ChristmasBanner } from "./christmas-banner";
import { mainnetConfig as ssrMainnetConfig } from "@/lib/wagmi";

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

// Singleton to store configs created on client-side
let clientConfigs: { mainnetConfig: ReturnType<typeof getDefaultConfig>; testnetConfig: ReturnType<typeof getDefaultConfig> } | null = null;

// Create configs with getDefaultConfig (client-side only)
function getOrCreateWagmiConfigs() {
  if (clientConfigs) return clientConfigs;

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  const arbitrumRpc = alchemyKey 
    ? `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : undefined;

  const arbitrumSepoliaRpc = alchemyKey
    ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`
    : undefined;

  const mainnetConfig = getDefaultConfig({
    appName: "Lockd",
    projectId,
    chains: [arbitrum],
    transports: {
      [arbitrum.id]: http(arbitrumRpc),
    },
    ssr: true,
  });

  const testnetConfig = getDefaultConfig({
    appName: "Lockd",
    projectId,
    chains: [arbitrum, arbitrumSepolia],
    transports: {
      [arbitrum.id]: http(arbitrumRpc),
      [arbitrumSepolia.id]: http(arbitrumSepoliaRpc),
    },
    ssr: true,
  });

  clientConfigs = { mainnetConfig, testnetConfig };
  return clientConfigs;
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
  const configsRef = useRef<typeof clientConfigs>(null);

  useEffect(() => {
    // Only create configs with connectors on client-side
    configsRef.current = getOrCreateWagmiConfigs();
    setTestnetEnabled(getInitialTestnetMode());
    setMounted(true);
  }, []);

  // Use SSR-safe config during server rendering, then switch to full config on client
  const config = mounted && configsRef.current
    ? (testnetEnabled ? configsRef.current.testnetConfig : configsRef.current.mainnetConfig)
    : ssrMainnetConfig;

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
