"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther, formatUnits, type Address } from "viem";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, ERC20_ABI, isValidContractAddress } from "@/lib/contracts";
import { shortenAddress, formatDeadline } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gift,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Validates and parses a deposit ID from URL parameter
 * @param id The raw URL parameter
 * @returns Validated bigint or null if invalid
 */
function parseDepositId(id: string | undefined): bigint | null {
  if (!id) return null;
  
  // Check if the string is a valid non-negative integer
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  
  try {
    const parsed = BigInt(trimmed);
    // Ensure it's non-negative (should always be true given regex above)
    if (parsed < BigInt(0)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function ClaimPage() {
  const params = useParams();
  const rawDepositId = params.id as string;
  const t = useTranslations("claimPage");

  // Validate deposit ID before using it
  const depositId = useMemo(() => parseDepositId(rawDepositId), [rawDepositId]);
  const isValidDepositId = depositId !== null;

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const isContractConfigured = isValidContractAddress(contractAddress);

  const { data: deposit, isLoading: isLoadingDeposit } = useReadContract({
    address: contractAddress,
    abi: CLAIMABLE_ABI,
    functionName: "getDeposit",
    args: depositId !== null ? [depositId] : undefined,
    query: {
      enabled: isValidDepositId && isContractConfigured,
    },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Parse deposit data
  const depositData = deposit
    ? {
        depositor: deposit[0],
        claimant: deposit[1],
        token: deposit[2],
        amount: deposit[3],
        deadline: deposit[4],
        claimed: deposit[5],
        title: deposit[6],
      }
    : null;

  const isETH =
    depositData?.token === "0x0000000000000000000000000000000000000000";
  const tokenAddress = !isETH && depositData?.token ? depositData.token as Address : undefined;

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
  const amount = depositData
    ? isETH
      ? formatEther(depositData.amount)
      : formatUnits(depositData.amount, decimals)
    : "0";
  const symbol = isETH ? "ETH" : (tokenSymbol ?? "Token");

  const handleClaim = () => {
    if (!contractAddress || !isContractConfigured || depositId === null) return;
    writeContract({
      address: contractAddress,
      abi: CLAIMABLE_ABI,
      functionName: "claim",
      args: [depositId],
    });
  };

  const isClaimant =
    isConnected &&
    address?.toLowerCase() === depositData?.claimant.toLowerCase();
  const deadlineReached =
    depositData &&
    BigInt(Math.floor(Date.now() / 1000)) > depositData.deadline;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="pt-32 pb-20 flex-1">
        <div className="mx-auto max-w-lg px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Invalid deposit ID */}
            {!isValidDepositId ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                  <h2 className="text-xl font-semibold">Invalid Deposit ID</h2>
                  <p className="mt-2 text-muted-foreground">
                    The deposit ID &quot;{rawDepositId}&quot; is not valid. Please check the URL and try again.
                  </p>
                </CardContent>
              </Card>
            ) : !isContractConfigured ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                  <h2 className="text-xl font-semibold">Service Unavailable</h2>
                  <p className="mt-2 text-muted-foreground">
                    The contract is not configured for this network. Please switch networks or contact support.
                  </p>
                </CardContent>
              </Card>
            ) : isLoadingDeposit ? (
              <Card className="border-border/40">
                <CardContent className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !depositData ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                  <h2 className="text-xl font-semibold">{t("notFound.title")}</h2>
                  <p className="mt-2 text-muted-foreground">
                    {t("notFound.description")}
                  </p>
                </CardContent>
              </Card>
            ) : depositData.claimed ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-primary" />
                  <h2 className="text-xl font-semibold">{t("alreadyClaimed.title")}</h2>
                  <p className="mt-2 text-muted-foreground">
                    {t("alreadyClaimed.description")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 overflow-hidden">
                {/* Header with gift icon */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>
                  {depositData.title ? (
                    <>
                      <h2 className="text-2xl font-bold">{depositData.title}</h2>
                      <p className="mt-2 text-muted-foreground">
                        {t("hasFundsToClaim")}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{t("hasFundsToClaim")}</h2>
                      <p className="mt-2 text-muted-foreground">
                        {t("sentViaClaimable")}
                      </p>
                    </>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Amount */}
                  <div className="mb-6 rounded-xl bg-secondary/50 p-6 text-center">
                    <p className="text-sm text-muted-foreground">{t("amount")}</p>
                    <p className="mt-1 font-mono text-4xl font-bold">
                      {amount} <span className="text-2xl">{symbol}</span>
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("from")}</span>
                      <span className="font-mono">
                        {shortenAddress(depositData.depositor)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("recipient")}</span>
                      <span className="font-mono">
                        {shortenAddress(depositData.claimant)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("deadline")}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {deadlineReached
                            ? t("expired")
                            : formatDeadline(Number(depositData.deadline))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-6">
                    {!isConnected ? (
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                          {t("connectToClaim")}
                        </p>
                        <ConnectButton />
                      </div>
                    ) : !isClaimant ? (
                      <div className="flex flex-col items-center gap-2 rounded-lg bg-destructive/10 p-4 text-center">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <p className="text-sm text-destructive">
                          {t("wrongAddress", { address: shortenAddress(depositData.claimant) })}
                        </p>
                      </div>
                    ) : (
                      <>
                        {error && (
                          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">
                              {/* Sanitize error messages - don't expose raw blockchain errors */}
                              {error.message?.includes("user rejected")
                                ? "Transaction was rejected by user"
                                : error.message?.includes("insufficient")
                                ? "Insufficient balance for this transaction"
                                : "Transaction failed. Please try again."}
                            </p>
                          </div>
                        )}

                        {isSuccess ? (
                          <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-4 text-center">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                            <p className="font-medium text-primary">
                              {t("successfullyClaimed")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("fundsToWallet")}
                            </p>
                          </div>
                        ) : (
                          <Button
                            className="w-full gap-2"
                            size="lg"
                            onClick={handleClaim}
                            disabled={isPending || isConfirming}
                          >
                            {isPending || isConfirming ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isPending
                                  ? t("confirmInWallet")
                                  : t("processing")}
                              </>
                            ) : (
                              <>
                                {t("claim", { amount, symbol })}
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Note about deadline */}
                  {!depositData.claimed && !deadlineReached && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      {t("deadlineNote")}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
