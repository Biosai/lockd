"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { mainnetConfig, testnetConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect } from "react";
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

export function Providers({ children }: { children: React.ReactNode }) {
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

  useEffect(() => {
    setTestnetEnabled(getInitialTestnetMode());
    setMounted(true);
  }, []);

  // Use mainnet config during SSR and initial render
  const config = mounted && testnetEnabled ? testnetConfig : mainnetConfig;

  return (
    <WagmiProvider config={config}>
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
