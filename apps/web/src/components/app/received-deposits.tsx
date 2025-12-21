"use client";

import { useAccount, useChainId, useReadContract, useReadContracts } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, isValidContractAddress } from "@/lib/contracts";
import { Inbox, Loader2, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { DepositCard } from "./sent-deposits";
import { useTranslations } from "next-intl";

interface Deposit {
  id: number;
  depositor: string;
  claimant: string;
  token: string;
  amount: bigint;
  deadline: bigint;
  claimed: boolean;
  title: string;
}

export function ReceivedDeposits() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const t = useTranslations("receivedDeposits");

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

  // Filter deposits where user is the claimant
  const deposits: Deposit[] = useMemo(() => {
    if (!depositsData || !address) return [];
    
    return depositsData
      .map((result, index) => {
        if (result.status === 'success' && result.result) {
          const [depositor, claimant, token, amount, deadline, claimed, title] = result.result as [string, string, string, bigint, bigint, boolean, string];
          return {
            id: Number(depositIds[index]),
            depositor,
            claimant,
            token,
            amount,
            deadline,
            claimed,
            title,
          };
        }
        return null;
      })
      .filter((d): d is Deposit => d !== null && d.claimant.toLowerCase() === address.toLowerCase());
  }, [depositsData, depositIds, address]);

  if (!isContractConfigured) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold">Contract not configured</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This network is not yet supported.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingCount || isLoadingDeposits) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">{t("emptyTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {deposits.map((deposit) => (
        <DepositCard key={deposit.id} deposit={deposit} type="received" />
      ))}
    </div>
  );
}
