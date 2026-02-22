"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, State } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";
import { arbitrumRpc, arbitrumSepoliaRpc } from "@/lib/wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

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
