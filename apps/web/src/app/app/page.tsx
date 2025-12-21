"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateDepositForm } from "@/components/app/create-deposit-form";
import { SentDeposits } from "@/components/app/sent-deposits";
import { ReceivedDeposits } from "@/components/app/received-deposits";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Send, Inbox, Plus, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AppPage() {
  const { isConnected } = useAccount();
  const t = useTranslations("app");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("connectWallet.title")}</h1>
              <p className="mt-2 text-muted-foreground">
                {t("connectWallet.description")}
              </p>
              <div className="mt-8">
                <ConnectButton />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
                <p className="mt-1 text-muted-foreground">
                  {t("dashboard.description")}
                </p>
              </div>

              <Tabs defaultValue="create" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="create" className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("tabs.lock")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="gap-2">
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("tabs.sent")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="received" className="gap-2">
                    <Inbox className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("tabs.received")}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                  <CreateDepositForm />
                </TabsContent>

                <TabsContent value="sent">
                  <SentDeposits />
                </TabsContent>

                <TabsContent value="received">
                  <ReceivedDeposits />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
