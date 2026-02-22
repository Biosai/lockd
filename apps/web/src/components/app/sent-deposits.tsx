"use client";

import { useAccount, useChainId, useReadContract, useSendTransaction, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { formatEther, formatUnits, encodeFunctionData, type Address } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, ERC20_ABI, isValidContractAddress } from "@/lib/contracts";
import { shortenAddress, formatDeadline, formatDate } from "@/lib/utils";
import { formatTransactionError } from "@/lib/format-transaction-error";
import type { Deposit } from "@/lib/types";
import { Clock, Loader2, RefreshCw, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export function SentDeposits() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const t = useTranslations("sentDeposits");

  const isContractConfigured = isValidContractAddress(contractAddress);

  const { data: depositCount, isLoading: isLoadingCount } = useReadContract({
    address: contractAddress,
    abi: CLAIMABLE_ABI,
    functionName: "depositCount",
    query: {
      enabled: isContractConfigured,
    },
  });

  const depositIds = useMemo(() => {
    if (!depositCount) return [];
    const count = Number(depositCount);
    return Array.from({ length: count }, (_, i) => BigInt(i));
  }, [depositCount]);

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

  const deposits: Deposit[] = useMemo(() => {
    if (!depositsData || !address) return [];
    
    return depositsData
      .map((result, index) => {
        if (result.status === 'success' && result.result) {
          const [depositor, claimant, token, amount, startTime, deadline, claimed, title] = result.result as [string, string, string, bigint, bigint, bigint, boolean, string];
          return {
            id: Number(depositIds[index]),
            depositor,
            claimant,
            token,
            amount,
            startTime,
            deadline,
            claimed,
            title,
          };
        }
        return null;
      })
      .filter((d): d is Deposit => d !== null && d.depositor.toLowerCase() === address.toLowerCase());
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
            <RefreshCw className="h-6 w-6 text-muted-foreground" />
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
        <DepositCard key={deposit.id} deposit={deposit} type="sent" />
      ))}
    </div>
  );
}

interface DepositCardProps {
  deposit: Deposit;
  type: "sent" | "received";
}

export function DepositCard({ deposit, type }: DepositCardProps) {
  const { address: account } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const isContractConfigured = isValidContractAddress(contractAddress);
  const tSent = useTranslations("sentDeposits");
  const tReceived = useTranslations("receivedDeposits");
  
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isETH = deposit.token === "0x0000000000000000000000000000000000000000";
  const tokenAddress = !isETH ? deposit.token as Address : undefined;

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress,
    },
  });

  const decimals = isETH ? 18 : (tokenDecimals ?? 18);
  const amount = isETH
    ? formatEther(deposit.amount)
    : formatUnits(deposit.amount, decimals);
  const symbol = isETH ? "ETH" : (tokenSymbol ?? "Token");
  
  const deadlineReached = BigInt(Math.floor(Date.now() / 1000)) > deposit.deadline;
  const canRefund = type === "sent" && deadlineReached && !deposit.claimed;
  const canClaim = type === "received" && !deposit.claimed;

  const handleAction = () => {
    if (!isContractConfigured || !account) return;

    if (canRefund) {
      const data = encodeFunctionData({
        abi: CLAIMABLE_ABI,
        functionName: "refund",
        args: [BigInt(deposit.id)],
      });
      sendTransaction({
        to: contractAddress,
        data,
      });
    } else if (canClaim) {
      const data = encodeFunctionData({
        abi: CLAIMABLE_ABI,
        functionName: "claim",
        args: [BigInt(deposit.id)],
      });
      sendTransaction({
        to: contractAddress,
        data,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-card p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {deposit.title && (
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-sm font-medium text-foreground truncate">
                {deposit.title}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold">
              {amount} {symbol}
            </span>
            {deposit.claimed && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {type === "sent" ? tSent("claimedRefunded") : tReceived("claimed")}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {type === "sent" ? (
              <>{tSent("to")} {shortenAddress(deposit.claimant)}</>
            ) : (
              <>{tReceived("from")} {shortenAddress(deposit.depositor)}</>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {deposit.claimed
              ? tSent("completed")
              : formatDeadline(Number(deposit.deadline))}
          </span>
        </div>
      </div>

      {!deposit.claimed && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {tSent("deadline")} {formatDate(Number(deposit.deadline))}
          </span>
          
          {(canRefund || canClaim) && (
            <Button
              size="sm"
              variant={canClaim ? "default" : "outline"}
              onClick={handleAction}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Processing...
                </>
              ) : canClaim ? (
                tReceived("claim")
              ) : (
                tSent("refund")
              )}
            </Button>
          )}
          
          {type === "sent" && !deadlineReached && !deposit.claimed && (
            <span className="text-xs text-muted-foreground">
              {tSent("canRefundAfter")}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{formatTransactionError(error)}</span>
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>{tSent("transactionSuccess")}</span>
        </div>
      )}
    </motion.div>
  );
}
