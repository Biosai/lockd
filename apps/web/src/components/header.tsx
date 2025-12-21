"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("header");

  const navigateToSection = (id: string) => {
    setMobileMenuOpen(false);
    
    // If we're on the home page, just scroll to the section
    if (pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If we're on another page, navigate to home with hash
      router.push(`/#${id}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => navigateToSection("how-it-works")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("howItWorks")}
          </button>
          <button
            onClick={() => navigateToSection("use-cases")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("useCases")}
          </button>
          <Link
            href="https://github.com/Biosai/lockd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} size="sm">
                          {t("connectWallet")}
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} variant="destructive" size="sm">
                          {t("wrongNetwork")}
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={openChainModal}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          {chain.hasIcon && (
                            <div
                              className="h-4 w-4 overflow-hidden rounded-full"
                              style={{ background: chain.iconBackground }}
                            >
                              {chain.iconUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  className="h-4 w-4"
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </Button>

                        <Button onClick={openAccountModal} variant="outline" size="sm">
                          {account.displayName}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
          <Link href="/app">
            <Button size="sm">{t("launchApp")}</Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/40 bg-background md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              <button
                onClick={() => navigateToSection("how-it-works")}
                className="text-left text-sm text-muted-foreground"
              >
                {t("howItWorks")}
              </button>
              <button
                onClick={() => navigateToSection("use-cases")}
                className="text-left text-sm text-muted-foreground"
              >
                {t("useCases")}
              </button>
              <Link
                href="https://github.com/Biosai/lockd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
              <hr className="border-border/40" />
              <LanguageSwitcher />
              <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">{t("launchApp")}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
