"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeFileHash, formatHash } from "@/lib/file-hash";
import { useTranslations } from "next-intl";

interface FileHasherProps {
  onHashComputed: (hash: `0x${string}`, fileName: string) => void;
  disabled?: boolean;
}

export function FileHasher({ onHashComputed, disabled }: FileHasherProps) {
  const t = useTranslations("certify");
  const [isHashing, setIsHashing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || disabled) return;

      const file = acceptedFiles[0];
      setFileName(file.name);
      setIsHashing(true);
      setHash(null);

      try {
        const computedHash = await computeFileHash(file);
        setHash(computedHash);
        onHashComputed(computedHash, file.name);
      } catch (error) {
        console.error("Error computing hash:", error);
      } finally {
        setIsHashing(false);
      }
    },
    [onHashComputed, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isHashing,
    multiple: false,
  });

  const copyHash = async () => {
    if (!hash) return;
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50"}
          ${disabled || isHashing ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        {isHashing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground">{t("computing")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isDragActive ? t("dropHere") : t("dragOrClick")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("fileNeverUploaded")}
              </p>
            </div>
          </div>
        )}
      </div>

      {hash && fileName && (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{fileName}</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs text-muted-foreground font-mono">
                  {formatHash(hash)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={copyHash}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
