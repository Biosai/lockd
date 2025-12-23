"use client";

import { useAccount, useChainId, useReadContract, useSendTransaction, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { formatEther, formatUnits, encodeFunctionData, type Address } from "viem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, ERC20_ABI, isValidContractAddress } from "@/lib/contracts";
import { shortenAddress, formatDeadline, formatDate } from "@/lib/utils";
import { Clock, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
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

export function SentDeposits() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const t = useTranslations("sentDeposits");

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

  // Filter deposits where user is the depositor
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

  // Debug: log any errors
  if (error) {
    console.error("SendTransaction error:", error);
  }

  const isETH = deposit.token === "0x0000000000000000000000000000000000000000";
  const tokenAddress = !isETH ? deposit.token as Address : undefined;

  // Fetch token decimals dynamically for ERC20 tokens
  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Fetch token symbol dynamically for ERC20 tokens
  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Use fetched decimals or fallback to 18 (most common)
  const decimals = isETH ? 18 : (tokenDecimals ?? 18);
  const amount = isETH
    ? formatEther(deposit.amount)
    : formatUnits(deposit.amount, decimals);
  const symbol = isETH ? "ETH" : (tokenSymbol ?? "Token");
  
  const deadlineReached = BigInt(Math.floor(Date.now() / 1000)) > deposit.deadline;
  const canRefund = type === "sent" && deadlineReached && !deposit.claimed;
  const canClaim = type === "received" && !deposit.claimed;

  const handleAction = () => {
    console.log("handleAction called", { 
      isContractConfigured, 
      contractAddress, 
      canRefund, 
      canClaim, 
      depositId: deposit.id,
      account,
      chainId 
    });
    
    if (!isContractConfigured) {
      console.error("Contract not configured for chain:", chainId);
      return;
    }

    if (!account) {
      console.error("No account connected");
      return;
    }
    
    if (canRefund) {
      console.log("Calling refund...");
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
      console.log("Calling claim...");
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
          <span>
            {/* Sanitize error messages - don't expose raw blockchain errors */}
            {(() => {
              const msg = error.message?.toLowerCase() || "";
              // User rejected the transaction
              if (msg.includes("user rejected") || msg.includes("user denied")) {
                return "Transaction was rejected by user";
              }
              // Insufficient balance
              if (msg.includes("insufficient")) {
                return "Insufficient balance for this transaction";
              }
              // Gas estimation failed - usually means the transaction would revert
              if (msg.includes("gas") || msg.includes("fee") || msg.includes("exceeds") || msg.includes("intrinsic")) {
                return "Transaction would fail. Please check that the deadline has passed and the deposit hasn't been claimed.";
              }
              // Contract reverts
              if (msg.includes("deadline") || msg.includes("DeadlineNotReached")) {
                return "Cannot refund yet - deadline has not been reached";
              }
              if (msg.includes("claimed") || msg.includes("AlreadyClaimed")) {
                return "This deposit has already been claimed or refunded";
              }
              if (msg.includes("NotDepositor") || msg.includes("not depositor")) {
                return "Only the original depositor can request a refund";
              }
              if (msg.includes("NotClaimant") || msg.includes("not claimant")) {
                return "Only the designated recipient can claim this deposit";
              }
              // Ledger-specific errors
              if (msg.includes("0x6b0c") || msg.includes("0x6700") || msg.includes("no app") || msg.includes("device is locked") || msg.includes("locked device")) {
                return "Ledger: Please unlock your device and open the Ethereum app";
              }
              if (msg.includes("disconnected") || msg.includes("transport") || msg.includes("hid") || msg.includes("cannot open")) {
                return "Ledger: Device disconnected. Please reconnect your Ledger and open the Ethereum app";
              }
              if (msg.includes("0x6985") || msg.includes("condition not satisfied")) {
                return "Ledger: Transaction rejected on device";
              }
              if (msg.includes("blind signing") || msg.includes("enable contract data") || msg.includes("contract data")) {
                return "Ledger: Please enable 'Blind signing' in the Ethereum app settings";
              }
              // Execution reverted without specific error
              if (msg.includes("execution reverted") || msg.includes("revert")) {
                return "Transaction failed. Please verify the deadline has passed and the deposit is still available.";
              }
              // Generic fallback
              return "Transaction failed. Please try again.";
            })()}
          </span>
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
