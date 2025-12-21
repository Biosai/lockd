"use client";

import { useAccount, useChainId } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { CLAIMABLE_ADDRESSES } from "@/lib/contracts";
import { Inbox, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real implementation, you'd use events or an indexer to get deposits for this user
  // For demo purposes, we'll show a placeholder UI
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
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
