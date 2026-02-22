"use client";

import { useState } from "react";
import { CertifyForm } from "@/components/certify/certify-form";
import { VerifyForm } from "@/components/certify/verify-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function AppCertifyPage() {
  const translations = useTranslations("certify");
  const [activeTab, setActiveTab] = useState("certify");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{translations("title")}</h1>
        <p className="mt-1 text-muted-foreground">{translations("description")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="certify">{translations("tabCertify")}</TabsTrigger>
          <TabsTrigger value="verify">{translations("tabVerify")}</TabsTrigger>
        </TabsList>

        <TabsContent value="certify">
          <div className="rounded-xl border border-border/40 bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">{translations("certifyTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {translations("certifyDescription")}
            </p>
            <CertifyForm />
          </div>
        </TabsContent>

        <TabsContent value="verify">
          <div className="rounded-xl border border-border/40 bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">{translations("verifyTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {translations("verifyDescription")}
            </p>
            <VerifyForm />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
