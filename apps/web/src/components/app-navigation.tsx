"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, FileCheck, CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";

const navigationItems = [
  { href: "/app", icon: Send, translationKey: "payments" as const },
  { href: "/app/certify", icon: FileCheck, translationKey: "certify" as const },
  { href: "/app/inheritance", icon: CalendarClock, translationKey: "inheritance" as const },
];

export function AppNavigation() {
  const pathname = usePathname();
  const translations = useTranslations("appNav");

  const isActive = (href: string): boolean => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-border/40">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex gap-1">
          {navigationItems.map(({ href, icon: Icon, translationKey }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {translations(translationKey)}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
