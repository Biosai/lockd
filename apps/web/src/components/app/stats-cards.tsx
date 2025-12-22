"use client";

import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, isValidContractAddress, TOKENS } from "@/lib/contracts";
import { Loader2, Layers, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useEthPrice } from "@/lib/use-eth-price";

interface Deposit {
  token: string;
  amount: bigint;
  claimed: boolean;
}

interface Stats {
  totalDeposits: number;
  usdLocked: number;
  usdClaimed: number;
}

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

// Stablecoin addresses (lowercase for comparison)
const STABLECOIN_ADDRESSES: Record<number, Set<string>> = {
  42161: new Set([
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831".toLowerCase(), // USDC
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9".toLowerCase(), // USDT
  ]),
  421614: new Set([]),
};

// Get decimals for known tokens, returns null for unknown tokens
function getKnownTokenDecimals(chainId: number, tokenAddress: string): number | null {
  const tokens = TOKENS[chainId];
  if (!tokens) return null;
  
  const normalizedAddress = tokenAddress.toLowerCase();
  for (const token of Object.values(tokens)) {
    if (token.address.toLowerCase() === normalizedAddress) {
      return token.decimals;
    }
  }
  return null;
}

export function StatsCards() {
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const t = useTranslations("stats");
  const { ethPrice, isLoading: isLoadingPrice } = useEthPrice();

  const isContractConfigured = isValidContractAddress(contractAddress);

  // Get total deposit count
  const { data: depositCount, isLoading: isLoadingCount } = useReadContract({
    address: contractAddress,
    abi: CLAIMABLE_ABI,
    functionName: "depositCount",
    query: {
      enabled: isContractConfigured,
    },
  });

  // Create array of deposit IDs to fetch
  const depositIds = useMemo(() => {
    if (!depositCount) return [];
    const count = Number(depositCount);
    return Array.from({ length: count }, (_, i) => BigInt(i));
  }, [depositCount]);

  // Fetch all deposit details
  const { data: depositsData, isLoading: isLoadingDeposits } = useReadContracts({
    contracts: depositIds.map((id) => ({
      address: contractAddress,
      abi: CLAIMABLE_ABI,
      functionName: 'getDeposit' as const,
      args: [id],
    })),
    query: {
      enabled: depositIds.length > 0 && isContractConfigured,
    },
  });

  // Compute statistics in USD
  const stats: Stats = useMemo(() => {
    const defaultStats: Stats = {
      totalDeposits: 0,
      usdLocked: 0,
      usdClaimed: 0,
    };

    if (!depositsData || ethPrice === null) return defaultStats;

    const deposits: Deposit[] = depositsData
      .map((result) => {
        if (result.status === 'success' && result.result) {
          const [, , token, amount, , claimed] = result.result as [string, string, string, bigint, bigint, boolean, string];
          return { token, amount, claimed };
        }
        return null;
      })
      .filter((d): d is Deposit => d !== null);

    const totalDeposits = deposits.length;
    let usdLocked = 0;
    let usdClaimed = 0;

    const stablecoins = STABLECOIN_ADDRESSES[chainId] || new Set();

    for (const deposit of deposits) {
      const tokenLower = deposit.token.toLowerCase();
      let usdValue = 0;

      if (deposit.token === ETH_ADDRESS) {
        // ETH: convert to USD using price feed
        const ethAmount = Number(formatEther(deposit.amount));
        usdValue = ethAmount * ethPrice;
      } else if (stablecoins.has(tokenLower)) {
        // Stablecoins (USDC, USDT): 1:1 with USD
        const decimals = getKnownTokenDecimals(chainId, deposit.token) ?? 6;
        usdValue = Number(formatUnits(deposit.amount, decimals));
      } else {
        // Other ERC20 tokens: try to get decimals, but skip USD conversion (we don't have price)
        // For now, we'll skip unknown tokens in USD calculation
        // Could be extended with more price feeds in the future
        continue;
      }

      if (deposit.claimed) {
        usdClaimed += usdValue;
      } else {
        usdLocked += usdValue;
      }
    }

    return { totalDeposits, usdLocked, usdClaimed };
  }, [depositsData, ethPrice, chainId]);

  const isLoading = isLoadingCount || isLoadingDeposits || isLoadingPrice;

  // Don't render anything if contract is not configured
  if (!isContractConfigured) {
    return null;
  }

  const formatUsd = (value: number) => {
    if (value >= 1000) {
      return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const statItems = [
    {
      label: t("totalDeposits"),
      value: isLoading ? null : stats.totalDeposits.toString(),
      icon: Layers,
    },
    {
      label: t("valueLocked"),
      value: isLoading ? null : formatUsd(stats.usdLocked),
      icon: Lock,
    },
    {
      label: t("valueClaimed"),
      value: isLoading ? null : formatUsd(stats.usdClaimed),
      icon: CheckCircle,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl border border-border/40 bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              {stat.value !== null ? (
                <p className="font-mono text-lg font-semibold">{stat.value}</p>
              ) : (
                <Loader2 className="mt-1 h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}



