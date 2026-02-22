"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { GithubIcon, TelegramIcon } from "@/components/ui/icons";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo & Description */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link
              href="/payments"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Payments
            </Link>
            <Link
              href="/inheritance"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Inheritance
            </Link>
            <Link
              href="/certify"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Certify
            </Link>
            <Link
              href="/app"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("launchApp")}
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://t.me/lockd_official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="Join our Telegram"
            >
              <TelegramIcon className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/Biosai/lockd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="View on GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {t("builtOn")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
