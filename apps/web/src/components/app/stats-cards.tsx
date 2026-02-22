"use client";

import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { 
  CLAIMABLE_ADDRESSES, 
  CLAIMABLE_ABI, 
  INHERITANCE_ADDRESSES,
  INHERITANCE_ABI,
  isValidContractAddress, 
  TOKENS 
} from "@/lib/contracts";
import { Loader2, Layers, Lock, CheckCircle, TrendingUp } from "lucide-react";
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

// Helper to compute USD value from deposits
function computeUsdValues(
  deposits: Deposit[],
  ethPrice: number,
  chainId: number
): { usdLocked: number; usdClaimed: number } {
  let usdLocked = 0;
  let usdClaimed = 0;
  const stablecoins = STABLECOIN_ADDRESSES[chainId] || new Set();

  for (const deposit of deposits) {
    const tokenLower = deposit.token.toLowerCase();
    let usdValue = 0;

    if (deposit.token === ETH_ADDRESS) {
      const ethAmount = Number(formatEther(deposit.amount));
      usdValue = ethAmount * ethPrice;
    } else if (stablecoins.has(tokenLower)) {
      const decimals = getKnownTokenDecimals(chainId, deposit.token) ?? 6;
      usdValue = Number(formatUnits(deposit.amount, decimals));
    } else {
      continue;
    }

    if (deposit.claimed) {
      usdClaimed += usdValue;
    } else {
      usdLocked += usdValue;
    }
  }

  return { usdLocked, usdClaimed };
}

export function StatsCards() {
  const chainId = useChainId();
  const claimableAddress = CLAIMABLE_ADDRESSES[chainId];
  const inheritanceAddress = INHERITANCE_ADDRESSES[chainId];
  const t = useTranslations("stats");
  const { ethPrice, isLoading: isLoadingPrice } = useEthPrice();

  const isClaimableConfigured = isValidContractAddress(claimableAddress);
  const isInheritanceConfigured = isValidContractAddress(inheritanceAddress);
  const hasAnyContract = isClaimableConfigured || isInheritanceConfigured;

  // ============ ExclusiveClaim Contract ============
  
  const { data: claimableCount, isLoading: isLoadingClaimableCount } = useReadContract({
    address: claimableAddress,
    abi: CLAIMABLE_ABI,
    functionName: "depositCount",
    query: {
      enabled: isClaimableConfigured,
    },
  });

  const claimableIds = useMemo(() => {
    if (!claimableCount) return [];
    const count = Number(claimableCount);
    return Array.from({ length: count }, (_, i) => BigInt(i));
  }, [claimableCount]);

  const { data: claimableDeposits, isLoading: isLoadingClaimableDeposits } = useReadContracts({
    contracts: claimableIds.map((id) => ({
      address: claimableAddress,
      abi: CLAIMABLE_ABI,
      functionName: 'getDeposit' as const,
      args: [id],
    })),
    query: {
      enabled: claimableIds.length > 0 && isClaimableConfigured,
    },
  });

  // ============ CryptoInheritance Contract ============
  
  const { data: inheritanceCount, isLoading: isLoadingInheritanceCount } = useReadContract({
    address: inheritanceAddress,
    abi: INHERITANCE_ABI,
    functionName: "depositCount",
    query: {
      enabled: isInheritanceConfigured,
    },
  });

  const inheritanceIds = useMemo(() => {
    if (!inheritanceCount) return [];
    const count = Number(inheritanceCount);
    return Array.from({ length: count }, (_, i) => BigInt(i));
  }, [inheritanceCount]);

  const { data: inheritanceDeposits, isLoading: isLoadingInheritanceDeposits } = useReadContracts({
    contracts: inheritanceIds.map((id) => ({
      address: inheritanceAddress,
      abi: INHERITANCE_ABI,
      functionName: 'getDeposit' as const,
      args: [id],
    })),
    query: {
      enabled: inheritanceIds.length > 0 && isInheritanceConfigured,
    },
  });

  // ============ Compute Combined Statistics ============

  const stats: Stats = useMemo(() => {
    const defaultStats: Stats = {
      totalDeposits: 0,
      usdLocked: 0,
      usdClaimed: 0,
    };

    if (ethPrice === null) return defaultStats;

    // Parse ExclusiveClaim deposits
    const parsedClaimable: Deposit[] = (claimableDeposits || [])
      .map((result) => {
        if (result.status === 'success' && result.result) {
          const [, , token, amount, , , claimed] = result.result as [string, string, string, bigint, bigint, bigint, boolean, string];
          return { token, amount, claimed };
        }
        return null;
      })
      .filter((d): d is Deposit => d !== null);

    // Parse CryptoInheritance deposits (has 2 extra fields: contentHash, claimSecretHash)
    const parsedInheritance: Deposit[] = (inheritanceDeposits || [])
      .map((result) => {
        if (result.status === 'success' && result.result) {
          const [, , token, amount, , , claimed] = result.result as [string, string, string, bigint, bigint, bigint, boolean, string, string, string];
          return { token, amount, claimed };
        }
        return null;
      })
      .filter((d): d is Deposit => d !== null);

    const claimableValues = computeUsdValues(parsedClaimable, ethPrice, chainId);
    const inheritanceValues = computeUsdValues(parsedInheritance, ethPrice, chainId);

    return {
      totalDeposits: parsedClaimable.length + parsedInheritance.length,
      usdLocked: claimableValues.usdLocked + inheritanceValues.usdLocked,
      usdClaimed: claimableValues.usdClaimed + inheritanceValues.usdClaimed,
    };
  }, [claimableDeposits, inheritanceDeposits, ethPrice, chainId]);

  const isLoading = 
    isLoadingClaimableCount || 
    isLoadingClaimableDeposits || 
    isLoadingInheritanceCount || 
    isLoadingInheritanceDeposits || 
    isLoadingPrice;

  // Don't render anything if no contracts are configured
  if (!hasAnyContract) {
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
      label: t("totalValueSecured"),
      value: isLoading ? null : formatUsd(stats.usdLocked + stats.usdClaimed),
      icon: TrendingUp,
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
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

