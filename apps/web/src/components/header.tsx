"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { GithubIcon } from "@/components/ui/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const landingNavigation = [
  { href: "/payments", translationKey: "payments" as const },
  { href: "/inheritance", translationKey: "inheritance" as const },
  { href: "/certify", translationKey: "certify" as const },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const translations = useTranslations("header");

  const isAppPage = pathname.startsWith("/app");

  return (
    <header className="fixed top-0 left-0 right-0 z-[100]">
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation — only on landing pages */}
          {!isAppPage && (
            <div className="hidden items-center gap-8 md:flex">
              {landingNavigation.map(({ href, translationKey }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm transition-colors hover:text-foreground ${
                    pathname === href ? "font-medium text-primary" : "text-muted-foreground"
                  }`}
                >
                  {translations(translationKey)}
                </Link>
              ))}
              <Link
                href="https://github.com/Biosai/lockd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <GithubIcon className="h-5 w-5" />
              </Link>
            </div>
          )}

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher />
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const isReady = mounted;
                const isConnected = isReady && account && chain;

                return (
                  <div {...(!isReady && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none", userSelect: "none" } })}>
                    {(() => {
                      if (!isConnected) {
                        return (
                          <Button onClick={openConnectModal} size="sm">
                            {translations("connectWallet")}
                          </Button>
                        );
                      }
                      if (chain.unsupported) {
                        return (
                          <Button onClick={openChainModal} variant="destructive" size="sm">
                            {translations("wrongNetwork")}
                          </Button>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <Button onClick={openChainModal} variant="outline" size="sm" className="gap-2">
                            {chain.hasIcon && (
                              <div className="h-4 w-4 overflow-hidden rounded-full" style={{ background: chain.iconBackground }}>
                                {chain.iconUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img alt={chain.name ?? "Chain icon"} src={chain.iconUrl} className="h-4 w-4" />
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
            {!isAppPage && (
              <Link href="/app">
                <Button size="sm">{translations("launchApp")}</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/40 bg-background md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-4">
                {!isAppPage &&
                  landingNavigation.map(({ href, translationKey }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-left text-sm ${
                        pathname === href ? "font-medium text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {translations(translationKey)}
                    </Link>
                  ))}
                <Link
                  href="https://github.com/Biosai/lockd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <GithubIcon className="h-4 w-4" />
                  GitHub
                </Link>
                <hr className="border-border/40" />
                <LanguageSwitcher />
                {!isAppPage && (
                  <Link href="/app" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">{translations("launchApp")}</Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
