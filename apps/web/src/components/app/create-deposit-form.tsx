"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContracts, useReadContract } from "wagmi";
import { parseEther, parseUnits, isAddress, type Address } from "viem";
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
import { formatTransactionError } from "@/lib/format-transaction-error";
import { AlertCircle, CheckCircle2, Loader2, Info, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type ApprovalStep = "idle" | "approving" | "approved";

type DeadlinePreset = "1h" | "24h" | "7d" | "30d" | "custom";

// Must match contract's MAX_TITLE_LENGTH
const MAX_TITLE_BYTES = 128;

// Calculate byte length of a string (for UTF-8 validation)
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

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
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Approval transaction (separate from deposit)
  const { 
    writeContract: writeApproval, 
    data: approvalHash, 
    isPending: isApprovalPending, 
    error: approvalError,
  } = useWriteContract();
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ 
    hash: approvalHash 
  });

  const contractAddress = CLAIMABLE_ADDRESSES[chainId];
  const isContractConfigured = isValidContractAddress(contractAddress);
  const tokens = TOKENS[chainId] || TOKENS[42161]; // Default to Arbitrum tokens

  // Reset selected token if it doesn't exist on current chain
  useEffect(() => {
    if (selectedToken !== "ETH" && selectedToken !== "CUSTOM" && !tokens[selectedToken]) {
      setSelectedToken("ETH");
    }
  }, [chainId, tokens, selectedToken]);

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


  // Update approval step when approval transaction succeeds and auto-trigger deposit
  useEffect(() => {
    if (isApprovalSuccess && approvalStep === "approving") {
      setApprovalStep("approved");
      refetchAllowance();
      
      // Auto-trigger deposit after successful approval
      // Small delay to ensure state is updated
      setTimeout(() => {
        const deadline = BigInt(Math.floor(Date.now() / 1000) + (deadlinePreset === "custom" && customDeadline 
          ? Math.floor(new Date(customDeadline).getTime() / 1000) - Math.floor(Date.now() / 1000)
          : (deadlinePreset === "1h" ? 60 * 60 : 
             deadlinePreset === "24h" ? 24 * 60 * 60 : 
             deadlinePreset === "7d" ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60)));
        
        if (selectedTokenInfo && tokenAddress && contractAddress && isContractConfigured) {
          const tokenAmount = parseUnits(amount, selectedTokenInfo.decimals);
          const startTime = 0n; // Immediate claiming
          writeContract({
            address: contractAddress,
            abi: CLAIMABLE_ABI,
            functionName: "depositToken",
            args: [
              recipient as `0x${string}`,
              tokenAddress,
              tokenAmount,
              startTime,
              deadline,
              title,
            ],
          });
        }
      }, 100);
    }
  }, [isApprovalSuccess, approvalStep, refetchAllowance, writeContract, selectedTokenInfo, tokenAddress, contractAddress, isContractConfigured, amount, recipient, title, deadlinePreset, customDeadline]);

  // Reset approval step when token or amount changes
  useEffect(() => {
    setApprovalStep("idle");
  }, [selectedToken, customTokenAddress, amount]);

  const isValidRecipient = recipient && isAddress(recipient);
  const isValidAmount = amount && parseFloat(amount) > 0;
  const isValidToken = selectedToken !== "CUSTOM" || (isValidCustomAddress && customTokenInfo !== null);
  
  // Calculate title byte length for validation
  const titleByteLength = useMemo(() => getByteLength(title), [title]);
  const isTitleValid = titleByteLength <= MAX_TITLE_BYTES;
  
  const getDeadlineTimestamp = (): bigint => {
    if (deadlinePreset === "custom" && customDeadline) {
      return BigInt(Math.floor(new Date(customDeadline).getTime() / 1000));
    }
    return BigInt(Math.floor(Date.now() / 1000) + DEADLINE_PRESETS[deadlinePreset].seconds);
  };

  // Handle ERC20 approval - approve exact amount for security
  const handleApprove = () => {
    if (!tokenAddress || !contractAddress || !isContractConfigured || !parsedAmount) return;
    
    setApprovalStep("approving");
    
    writeApproval({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contractAddress, parsedAmount],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidRecipient || !isValidAmount || !isValidToken || !isTitleValid || !contractAddress || !isContractConfigured) return;

    if (isERC20 && needsApproval && approvalStep !== "approved") {
      handleApprove();
      return;
    }

    const deadline = getDeadlineTimestamp();
    const startTime = 0n;

    if (selectedToken === "ETH") {
      writeContract({
        address: contractAddress,
        abi: CLAIMABLE_ABI,
        functionName: "depositETH",
        args: [recipient as `0x${string}`, startTime, deadline, title],
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
          startTime,
          deadline,
          title,
        ],
      });
    }
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

          {/* Message / Purpose */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("messageLabel")}</Label>
            <Input
              id="title"
              placeholder={t("messagePlaceholder")}
              value={title}
              onChange={(e) => {
                const newValue = e.target.value;
                // Only update if within byte limit, or if deleting characters
                if (getByteLength(newValue) <= MAX_TITLE_BYTES || newValue.length < title.length) {
                  setTitle(newValue);
                }
              }}
              className={!isTitleValid ? "border-destructive" : ""}
            />
            <p className={`text-xs ${!isTitleValid ? "text-destructive" : "text-muted-foreground"}`}>
              {titleByteLength}/{MAX_TITLE_BYTES} bytes
              {titleByteLength !== title.length && ` (${title.length} chars)`}
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
                    You need to approve exactly {amount} {selectedTokenInfo?.symbol || "tokens"} for this deposit. This is more secure than unlimited approvals.
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
                  {formatTransactionError(error || approvalError)}
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
              !isTitleValid ||
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
            ) : isERC20 && needsApproval && approvalStep !== "approved" ? (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Approve {amount} {selectedTokenInfo?.symbol || "Token"}
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
