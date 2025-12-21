"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContracts, useReadContract } from "wagmi";
import { parseEther, parseUnits, isAddress, type Address, maxUint256 } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLAIMABLE_ADDRESSES, CLAIMABLE_ABI, TOKENS, ERC20_ABI, isValidContractAddress } from "@/lib/contracts";
import { AlertCircle, CheckCircle2, Loader2, Info, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type ApprovalStep = "idle" | "approving" | "approved";

type DeadlinePreset = "1h" | "24h" | "7d" | "30d" | "custom";

export function CreateDepositForm() {
  const { address } = useAccount();
  const chainId = useChainId();
  const t = useTranslations("createDeposit");
  
  const DEADLINE_PRESETS: Record<DeadlinePreset, { label: string; seconds: number }> = {
    "1h": { label: t("deadline1h"), seconds: 60 * 60 },
    "24h": { label: t("deadline24h"), seconds: 24 * 60 * 60 },
    "7d": { label: t("deadline7d"), seconds: 7 * 24 * 60 * 60 },
    "30d": { label: t("deadline30d"), seconds: 30 * 24 * 60 * 60 },
    custom: { label: t("deadlineCustom"), seconds: 0 },
  };
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [deadlinePreset, setDeadlinePreset] = useState<DeadlinePreset>("24h");
  const [customDeadline, setCustomDeadline] = useState("");
  const [title, setTitle] = useState("");
  const [approvalStep, setApprovalStep] = useState<ApprovalStep>("idle");
  
  // Deposit transaction
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Approval transaction (separate from deposit)
  const { 
    writeContract: writeApproval, 
    data: approvalHash, 
    isPending: isApprovalPending, 
    error: approvalError 
  } = useWriteContract();
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ 
    hash: approvalHash 
  });

  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const isContractConfigured = isValidContractAddress(contractAddress);
  const tokens = TOKENS[chainId] || TOKENS[42161]; // Default to Arbitrum tokens

  // Fetch custom token metadata
  const isValidCustomAddress = customTokenAddress.length > 0 && isAddress(customTokenAddress);
  const { data: customTokenData, isLoading: isLoadingCustomToken, isError: isCustomTokenError } = useReadContracts({
    contracts: [
      {
        address: customTokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "symbol",
      },
      {
        address: customTokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: selectedToken === "CUSTOM" && isValidCustomAddress,
    },
  });

  const customTokenInfo = useMemo(() => {
    if (!customTokenData || customTokenData[0].status !== "success" || customTokenData[1].status !== "success") {
      return null;
    }
    return {
      address: customTokenAddress as Address,
      symbol: customTokenData[0].result as string,
      decimals: customTokenData[1].result as number,
    };
  }, [customTokenData, customTokenAddress]);

  const selectedTokenInfo = selectedToken === "CUSTOM" ? customTokenInfo : tokens[selectedToken];
  const isERC20 = selectedToken !== "ETH";
  const tokenAddress = isERC20 ? selectedTokenInfo?.address : undefined;

  // Calculate parsed token amount for allowance comparison
  const parsedAmount = useMemo(() => {
    if (!amount || !selectedTokenInfo || parseFloat(amount) <= 0) return BigInt(0);
    try {
      return parseUnits(amount, selectedTokenInfo.decimals);
    } catch {
      return BigInt(0);
    }
  }, [amount, selectedTokenInfo]);

  // Fetch current allowance for ERC20 tokens
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && contractAddress ? [address, contractAddress] : undefined,
    query: {
      enabled: isERC20 && !!tokenAddress && !!address && isContractConfigured,
    },
  });

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!isERC20 || !parsedAmount || parsedAmount === BigInt(0)) return false;
    if (currentAllowance === undefined) return true; // Assume needs approval if not loaded
    return currentAllowance < parsedAmount;
  }, [isERC20, parsedAmount, currentAllowance]);

  // Update approval step when approval transaction succeeds
  useEffect(() => {
    if (isApprovalSuccess) {
      setApprovalStep("approved");
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);

  // Reset approval step when token or amount changes
  useEffect(() => {
    setApprovalStep("idle");
  }, [selectedToken, customTokenAddress, amount]);

  const isValidRecipient = recipient && isAddress(recipient);
  const isValidAmount = amount && parseFloat(amount) > 0;
  const isValidToken = selectedToken !== "CUSTOM" || (isValidCustomAddress && customTokenInfo !== null);
  
  const getDeadlineTimestamp = (): bigint => {
    if (deadlinePreset === "custom" && customDeadline) {
      return BigInt(Math.floor(new Date(customDeadline).getTime() / 1000));
    }
    return BigInt(Math.floor(Date.now() / 1000) + DEADLINE_PRESETS[deadlinePreset].seconds);
  };

  // Handle ERC20 approval
  const handleApprove = async () => {
    if (!tokenAddress || !contractAddress || !isContractConfigured) return;
    
    setApprovalStep("approving");
    writeApproval({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contractAddress, maxUint256], // Approve max for convenience
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidRecipient || !isValidAmount || !isValidToken || !contractAddress || !isContractConfigured) return;

    // For ERC20 tokens, ensure approval is done first
    if (isERC20 && needsApproval) {
      handleApprove();
      return;
    }

    const deadline = getDeadlineTimestamp();

    if (selectedToken === "ETH") {
      writeContract({
        address: contractAddress,
        abi: CLAIMABLE_ABI,
        functionName: "depositETH",
        args: [recipient as `0x${string}`, deadline, title],
        value: parseEther(amount),
      });
    } else {
      if (!selectedTokenInfo || !tokenAddress) return;
      
      const tokenAmount = parseUnits(amount, selectedTokenInfo.decimals);
      
      writeContract({
        address: contractAddress,
        abi: CLAIMABLE_ABI,
        functionName: "depositToken",
        args: [
          recipient as `0x${string}`,
          tokenAddress,
          tokenAmount,
          deadline,
          title,
        ],
      });
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setSelectedToken("ETH");
    setCustomTokenAddress("");
    setDeadlinePreset("24h");
    setCustomDeadline("");
    setTitle("");
  };

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">{t("recipientLabel")}</Label>
            <Input
              id="recipient"
              placeholder={t("recipientPlaceholder")}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={recipient && !isValidRecipient ? "border-destructive" : ""}
            />
            {recipient && !isValidRecipient && (
              <p className="text-xs text-destructive">{t("invalidAddress")}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 64))}
              maxLength={64}
            />
            <p className="text-xs text-muted-foreground">
              {t("titleCharCount", { count: title.length })}
            </p>
          </div>

          {/* Amount & Token */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("amountLabel")}</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("tokenLabel")}</Label>
              <Select value={selectedToken} onValueChange={(value) => {
                setSelectedToken(value);
                if (value !== "CUSTOM") {
                  setCustomTokenAddress("");
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tokens).map(([symbol, info]) => (
                    <SelectItem key={symbol} value={symbol}>
                      {info.symbol}
                    </SelectItem>
                  ))}
                  <SelectItem value="CUSTOM">{t("customToken")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Token Address */}
          <AnimatePresence>
            {selectedToken === "CUSTOM" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  <Label htmlFor="customToken">{t("customTokenAddressLabel")}</Label>
                  <Input
                    id="customToken"
                    placeholder={t("customTokenAddressPlaceholder")}
                    value={customTokenAddress}
                    onChange={(e) => setCustomTokenAddress(e.target.value)}
                    className={customTokenAddress && !isValidCustomAddress ? "border-destructive" : ""}
                  />
                  {customTokenAddress && !isValidCustomAddress && (
                    <p className="text-xs text-destructive">{t("invalidTokenAddress")}</p>
                  )}
                  {isValidCustomAddress && isLoadingCustomToken && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t("loadingTokenInfo")}
                    </p>
                  )}
                  {isValidCustomAddress && isCustomTokenError && (
                    <p className="text-xs text-destructive">{t("invalidERC20Token")}</p>
                  )}
                  {customTokenInfo && (
                    <p className="text-xs text-primary">
                      {t("tokenDetected", { symbol: customTokenInfo.symbol, decimals: customTokenInfo.decimals })}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>{t("deadlineLabel")}</Label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(DEADLINE_PRESETS) as DeadlinePreset[]).map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={deadlinePreset === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeadlinePreset(preset)}
                  className="text-xs"
                >
                  {DEADLINE_PRESETS[preset].label}
                </Button>
              ))}
            </div>
            <AnimatePresence>
              {deadlinePreset === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Input
                    type="datetime-local"
                    value={customDeadline}
                    onChange={(e) => setCustomDeadline(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="mt-2"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p>
                {t("infoText")}
              </p>
            </div>
          </div>

          {/* Contract Not Configured Warning */}
          <AnimatePresence>
            {!isContractConfigured && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Contract not configured for this network. Please contact the administrator.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approval Status Display */}
          <AnimatePresence>
            {isERC20 && needsApproval && approvalStep !== "approved" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400"
              >
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Token approval required</p>
                  <p className="text-muted-foreground">
                    You need to approve the contract to spend your {selectedTokenInfo?.symbol || "tokens"} before depositing.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approval Success Display */}
          <AnimatePresence>
            {isApprovalSuccess && approvalStep === "approved" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg bg-primary/10 p-4 text-primary"
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Token approved!</p>
                  <p className="text-muted-foreground">
                    You can now create the deposit.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {(error || approvalError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  {/* Sanitize error message - don't expose raw blockchain errors */}
                  {(error?.message || approvalError?.message)?.includes("user rejected") 
                    ? "Transaction was rejected by user"
                    : (error?.message || approvalError?.message)?.includes("insufficient")
                    ? "Insufficient balance for this transaction"
                    : "Transaction failed. Please try again."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Display */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg bg-primary/10 p-4 text-primary"
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{t("successTitle")}</p>
                  <p className="text-muted-foreground">
                    {t("successDescription")}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit / Approve Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              !isValidRecipient || 
              !isValidAmount || 
              !isValidToken || 
              !isContractConfigured ||
              isPending || 
              isConfirming || 
              isApprovalPending || 
              isApprovalConfirming
            }
          >
            {isApprovalPending || isApprovalConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApprovalPending ? "Approve in wallet..." : "Approving..."}
              </>
            ) : isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? t("confirmInWallet") : t("processing")}
              </>
            ) : isSuccess ? (
              t("createAnother")
            ) : isERC20 && needsApproval ? (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Approve {selectedTokenInfo?.symbol || "Token"}
              </>
            ) : (
              t("createDeposit")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
