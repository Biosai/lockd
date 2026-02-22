"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppNavigation } from "@/components/app-navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <AppNavigation />
      <main className="flex-1 pt-6 pb-20">
        <div className="mx-auto max-w-3xl px-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
