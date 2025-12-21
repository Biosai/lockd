"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther, formatUnits } from "viem";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI } from "@/lib/contracts";
import { shortenAddress, formatDeadline, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gift,
  ArrowRight,
} from "lucide-react";

export default function ClaimPage() {
  const params = useParams();
  const depositId = params.id as string;

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = CLAIMABLE_ADDRESSES[chainId];

  const { data: deposit, isLoading: isLoadingDeposit } = useReadContract({
    address: contractAddress,
    abi: CLAIMABLE_ABI,
    functionName: "getDeposit",
    args: [BigInt(depositId || 0)],
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaim = () => {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: CLAIMABLE_ABI,
      functionName: "claim",
      args: [BigInt(depositId)],
    });
  };

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
  const amount = depositData
    ? isETH
      ? formatEther(depositData.amount)
      : formatUnits(depositData.amount, 6)
    : "0";
  const symbol = isETH ? "ETH" : "Token";

  const isClaimant =
    isConnected &&
    address?.toLowerCase() === depositData?.claimant.toLowerCase();
  const deadlineReached =
    depositData &&
    BigInt(Math.floor(Date.now() / 1000)) > depositData.deadline;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-lg px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoadingDeposit ? (
              <Card className="border-border/40">
                <CardContent className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !depositData ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                  <h2 className="text-xl font-semibold">Deposit Not Found</h2>
                  <p className="mt-2 text-muted-foreground">
                    This deposit does not exist or the link is invalid.
                  </p>
                </CardContent>
              </Card>
            ) : depositData.claimed ? (
              <Card className="border-border/40">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-primary" />
                  <h2 className="text-xl font-semibold">Already Claimed</h2>
                  <p className="mt-2 text-muted-foreground">
                    This deposit has already been claimed or refunded.
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
                        You have funds to claim!
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">You have funds to claim!</h2>
                      <p className="mt-2 text-muted-foreground">
                        Someone has sent you crypto via Claimable
                      </p>
                    </>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Amount */}
                  <div className="mb-6 rounded-xl bg-secondary/50 p-6 text-center">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="mt-1 font-mono text-4xl font-bold">
                      {amount} <span className="text-2xl">{symbol}</span>
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">From</span>
                      <span className="font-mono">
                        {shortenAddress(depositData.depositor)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Recipient</span>
                      <span className="font-mono">
                        {shortenAddress(depositData.claimant)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Deadline</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {deadlineReached
                            ? "Expired"
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
                          Connect your wallet to claim
                        </p>
                        <ConnectButton />
                      </div>
                    ) : !isClaimant ? (
                      <div className="flex flex-col items-center gap-2 rounded-lg bg-destructive/10 p-4 text-center">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <p className="text-sm text-destructive">
                          This deposit is for a different address. Connect with{" "}
                          {shortenAddress(depositData.claimant)} to claim.
                        </p>
                      </div>
                    ) : (
                      <>
                        {error && (
                          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">{error.message}</p>
                          </div>
                        )}

                        {isSuccess ? (
                          <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-4 text-center">
                            <CheckCircle2 className="h-8 w-8 text-primary" />
                            <p className="font-medium text-primary">
                              Successfully claimed!
                            </p>
                            <p className="text-sm text-muted-foreground">
                              The funds have been sent to your wallet.
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
                                  ? "Confirm in wallet..."
                                  : "Processing..."}
                              </>
                            ) : (
                              <>
                                Claim {amount} {symbol}
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
                      After the deadline, the sender can reclaim these funds if
                      unclaimed.
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

