"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { FileHasher } from "./file-hasher";
import { CERTIFICATION_ADDRESSES, CERTIFICATION_ABI, isValidContractAddress } from "@/lib/contracts";
import { formatHash } from "@/lib/file-hash";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

export function CertifyForm() {
  const t = useTranslations("certify");
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = CERTIFICATION_ADDRESSES[chainId];
  const isContractConfigured = isValidContractAddress(contractAddress);

  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { data: txHash, writeContract, isPending: isWritePending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleHashComputed = (computedHash: `0x${string}`, name: string) => {
    setHash(computedHash);
    setFileName(name);
    reset();
  };

  const handleCertify = () => {
    if (!hash || !isContractConfigured) return;

    writeContract({
      address: contractAddress,
      abi: CERTIFICATION_ABI,
      functionName: "certify",
      args: [hash],
    });
  };

  const handleReset = () => {
    setHash(null);
    setFileName(null);
    reset();
  };

  const isPending = isWritePending || isConfirming;

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-8 text-center">
        <p className="text-muted-foreground">{t("connectWalletToCertify")}</p>
      </div>
    );
  }

  if (!isContractConfigured) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-8 text-center">
        <p className="text-muted-foreground">{t("contractNotConfigured")}</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{t("certificationSuccess")}</h3>
            <p className="text-muted-foreground mt-1">{t("certificationSuccessDesc")}</p>
          </div>
          {fileName && (
            <div className="rounded-lg bg-card border border-border/40 px-4 py-2">
              <p className="text-sm font-medium">{fileName}</p>
              <code className="text-xs text-muted-foreground">{hash && formatHash(hash)}</code>
            </div>
          )}
          {txHash && (
            <a
              href={`https://arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {t("viewTransaction")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Button onClick={handleReset} variant="outline" className="mt-2">
            {t("certifyAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileHasher onHashComputed={handleHashComputed} disabled={isPending} />

      {hash && (
        <div className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground">{t("hashToStore")}</p>
            <code className="text-sm font-mono break-all">{hash}</code>
          </div>

          <Button
            onClick={handleCertify}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isWritePending ? t("confirmInWallet") : t("processing")}
              </>
            ) : (
              t("certifyOnChain")
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {t("certifyNote")}
          </p>
        </div>
      )}
    </div>
  );
}
