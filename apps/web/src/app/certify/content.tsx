"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, FileCheck, ArrowRight, Lock, Eye, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export function CertifyLandingContent() {
  const translations = useTranslations("certify");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          {/* Hero */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm mb-6">
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary font-medium">{translations("badge")}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {translations("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {translations("description")}
            </p>
            <div className="mt-8">
              <Link href="/app/certify">
                <Button size="lg" className="gap-2">
                  {translations("certifyButton") || "Certify a File"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-2 gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
              <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{translations("feature1")}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{translations("feature2")}</p>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            className="rounded-xl border border-border/40 bg-secondary/30 p-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">{translations("howItWorksTitle")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  1
                </div>
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <Lock className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">{translations("howItWorks1")}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  2
                </div>
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <Eye className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">{translations("howItWorks2")}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  3
                </div>
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">{translations("howItWorks3")}</p>
              </div>
            </div>
          </motion.div>

          {/* Use Cases */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">Use Cases</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "Intellectual Property", description: "Prove when you created a design, code, or idea before anyone else." },
                { title: "Legal Documents", description: "Timestamp contracts, agreements, and evidence with blockchain certainty." },
                { title: "Research Priority", description: "Establish when a discovery or finding was first documented." },
                { title: "Audit Trails", description: "Create verifiable records of documents at specific points in time." },
              ].map((useCase) => (
                <div key={useCase.title} className="rounded-xl border border-border/40 bg-card p-4">
                  <h3 className="font-medium">{useCase.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/app/certify">
              <Button size="lg" className="gap-2">
                Start Certifying
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
