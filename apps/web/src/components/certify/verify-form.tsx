"use client";

import { useState } from "react";
import { useChainId, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileHasher } from "./file-hasher";
import { CERTIFICATION_ADDRESSES, CERTIFICATION_ABI, isValidContractAddress } from "@/lib/contracts";
import { isValidBytes32, formatHash } from "@/lib/file-hash";
import { CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function VerifyForm() {
  const t = useTranslations("certify");
  const chainId = useChainId();
  const contractAddress = CERTIFICATION_ADDRESSES[chainId];
  const isContractConfigured = isValidContractAddress(contractAddress);

  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [manualHash, setManualHash] = useState("");
  const [searchHash, setSearchHash] = useState<`0x${string}` | null>(null);

  const { data: certification, isLoading } = useReadContract({
    address: contractAddress,
    abi: CERTIFICATION_ABI,
    functionName: "getCertification",
    args: searchHash ? [searchHash] : undefined,
    query: {
      enabled: !!searchHash && isContractConfigured,
    },
  });

  const handleHashComputed = (computedHash: `0x${string}`, name: string) => {
    setHash(computedHash);
    setFileName(name);
    setManualHash("");
    setSearchHash(computedHash);
  };

  const handleManualSearch = () => {
    if (isValidBytes32(manualHash)) {
      setHash(manualHash as `0x${string}`);
      setFileName(null);
      setSearchHash(manualHash as `0x${string}`);
    }
  };

  const handleManualHashChange = (value: string) => {
    setManualHash(value);
    // Auto-search when valid hash is pasted
    if (isValidBytes32(value)) {
      setHash(value as `0x${string}`);
      setFileName(null);
      setSearchHash(value as `0x${string}`);
    }
  };

  const isCertified = certification && certification[0] !== "0x0000000000000000000000000000000000000000";
  const certifier = certification?.[0];
  const timestamp = certification?.[1];

  if (!isContractConfigured) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-8 text-center">
        <p className="text-muted-foreground">{t("contractNotConfigured")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File upload option */}
      <div>
        <Label className="text-sm font-medium mb-2 block">{t("verifyByFile")}</Label>
        <FileHasher onHashComputed={handleHashComputed} />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("or")}</span>
        </div>
      </div>

      {/* Manual hash input */}
      <div>
        <Label htmlFor="hash" className="text-sm font-medium mb-2 block">
          {t("verifyByHash")}
        </Label>
        <div className="flex gap-2">
          <Input
            id="hash"
            placeholder="0x..."
            value={manualHash}
            onChange={(e) => handleManualHashChange(e.target.value)}
            className="font-mono text-sm"
          />
          <Button
            onClick={handleManualSearch}
            disabled={!isValidBytes32(manualHash) || isLoading}
            variant="outline"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading && searchHash && (
        <div className="rounded-xl border border-border/40 bg-card p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">{t("verifying")}</p>
        </div>
      )}

      {!isLoading && searchHash && certification && (
        <div
          className={`rounded-xl border p-6 ${
            isCertified
              ? "border-primary/30 bg-primary/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                isCertified ? "bg-primary/10" : "bg-destructive/10"
              }`}
            >
              {isCertified ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">
                {isCertified ? t("verified") : t("notFound")}
              </h3>
              
              {fileName && (
                <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
              )}
              
              <code className="text-xs text-muted-foreground font-mono block mt-1">
                {formatHash(searchHash)}
              </code>

              {isCertified && certifier && timestamp && (
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("certifiedBy")}: </span>
                    <code className="font-mono text-xs">
                      {certifier.slice(0, 10)}...{certifier.slice(-8)}
                    </code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("certifiedOn")}: </span>
                    <span>
                      {new Date(Number(timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {!isCertified && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t("notFoundDesc")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
