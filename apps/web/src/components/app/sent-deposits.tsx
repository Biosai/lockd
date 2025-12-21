"use client";

import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI } from "@/lib/contracts";
import { shortenAddress, formatDeadline, formatDate } from "@/lib/utils";
import { Clock, ExternalLink, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

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

export function SentDeposits() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: depositCount } = useReadContract({
    address: contractAddress,
    abi: CLAIMABLE_ABI,
    functionName: "depositCount",
  });

  // In a real implementation, you'd use events or an indexer to get user's deposits
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
            <RefreshCw className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No deposits yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Deposits you create will appear here. You can refund them after the deadline.
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
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isETH = deposit.token === "0x0000000000000000000000000000000000000000";
  const amount = isETH
    ? formatEther(deposit.amount)
    : formatUnits(deposit.amount, 6); // Assume 6 decimals for tokens
  const symbol = isETH ? "ETH" : "Token";
  
  const deadlineReached = BigInt(Math.floor(Date.now() / 1000)) > deposit.deadline;
  const canRefund = type === "sent" && deadlineReached && !deposit.claimed;
  const canClaim = type === "received" && !deposit.claimed;

  const handleAction = () => {
    if (canRefund) {
      writeContract({
        address: contractAddress!,
        abi: CLAIMABLE_ABI,
        functionName: "refund",
        args: [BigInt(deposit.id)],
      });
    } else if (canClaim) {
      writeContract({
        address: contractAddress!,
        abi: CLAIMABLE_ABI,
        functionName: "claim",
        args: [BigInt(deposit.id)],
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
        <div>
          {deposit.title && (
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {deposit.title}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold">
              {amount} {symbol}
            </span>
            {deposit.claimed && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {type === "sent" ? "Claimed/Refunded" : "Claimed"}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {type === "sent" ? (
              <>To: {shortenAddress(deposit.claimant)}</>
            ) : (
              <>From: {shortenAddress(deposit.depositor)}</>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {deposit.claimed
              ? "Completed"
              : formatDeadline(Number(deposit.deadline))}
          </span>
        </div>
      </div>

      {!deposit.claimed && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Deadline: {formatDate(Number(deposit.deadline))}
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
                "Claim"
              ) : (
                "Refund"
              )}
            </Button>
          )}
          
          {type === "sent" && !deadlineReached && !deposit.claimed && (
            <span className="text-xs text-muted-foreground">
              Can refund after deadline
            </span>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>Transaction successful!</span>
        </div>
      )}
    </motion.div>
  );
}

