"use client";

import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { formatEther } from "viem";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, isValidContractAddress } from "@/lib/contracts";
import { Loader2, Layers, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface Deposit {
  token: string;
  amount: bigint;
  claimed: boolean;
}

interface Stats {
  totalDeposits: number;
  ethLocked: bigint;
  ethClaimed: bigint;
}

const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

export function StatsCards() {
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const t = useTranslations("stats");

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

  // Compute statistics
  const stats: Stats = useMemo(() => {
    const defaultStats: Stats = {
      totalDeposits: 0,
      ethLocked: BigInt(0),
      ethClaimed: BigInt(0),
    };

    if (!depositsData) return defaultStats;

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

    // Sum ETH amounts (only ETH deposits)
    const ethDeposits = deposits.filter((d) => d.token === ETH_ADDRESS);
    const ethLocked = ethDeposits
      .filter((d) => !d.claimed)
      .reduce((sum, d) => sum + d.amount, BigInt(0));
    const ethClaimed = ethDeposits
      .filter((d) => d.claimed)
      .reduce((sum, d) => sum + d.amount, BigInt(0));

    return { totalDeposits, ethLocked, ethClaimed };
  }, [depositsData]);

  const isLoading = isLoadingCount || isLoadingDeposits;

  // Don't render anything if contract is not configured
  if (!isContractConfigured) {
    return null;
  }

  const statItems = [
    {
      label: t("totalDeposits"),
      value: isLoading ? null : stats.totalDeposits.toString(),
      icon: Layers,
    },
    {
      label: t("valueLocked"),
      value: isLoading ? null : `${Number(formatEther(stats.ethLocked)).toFixed(4)} ETH`,
      icon: Lock,
    },
    {
      label: t("valueClaimed"),
      value: isLoading ? null : `${Number(formatEther(stats.ethClaimed)).toFixed(4)} ETH`,
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

