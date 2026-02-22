"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Clock,
  Zap,
  Coins,
  Send,
  CheckCircle2,
  FileText,
  Target,
  Users,
  Gift,
} from "lucide-react";
import { useTranslations } from "next-intl";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export function PaymentsLandingContent() {
  const translations = useTranslations("home");
  const translationsFeatures = useTranslations("features");
  const translationsUseCases = useTranslations("useCases");
  const translationsHowItWorks = useTranslations("howItWorks");

  const steps = [
    {
      number: translationsHowItWorks("step1.number"),
      title: translationsHowItWorks("step1.title"),
      description: translationsHowItWorks("step1.description"),
      icon: Shield,
    },
    {
      number: translationsHowItWorks("step2.number"),
      title: translationsHowItWorks("step2.title"),
      description: translationsHowItWorks("step2.description"),
      icon: CheckCircle2,
    },
    {
      number: translationsHowItWorks("step3.number"),
      title: translationsHowItWorks("step3.title"),
      description: translationsHowItWorks("step3.description"),
      icon: Clock,
    },
  ];

  const useCases = [
    { icon: FileText, title: translationsUseCases("freelance.title"), description: translationsUseCases("freelance.description"), example: translationsUseCases("freelance.example") },
    { icon: Target, title: translationsUseCases("bounties.title"), description: translationsUseCases("bounties.description"), example: translationsUseCases("bounties.example") },
    { icon: Users, title: translationsUseCases("p2p.title"), description: translationsUseCases("p2p.description"), example: translationsUseCases("p2p.example") },
    { icon: Gift, title: translationsUseCases("gifts.title"), description: translationsUseCases("gifts.description"), example: translationsUseCases("gifts.example") },
    { icon: Coins, title: translationsUseCases("invoices.title"), description: translationsUseCases("invoices.description"), example: translationsUseCases("invoices.example") },
    { icon: Shield, title: translationsUseCases("escrow.title"), description: translationsUseCases("escrow.description"), example: translationsUseCases("escrow.example") },
  ];

  const features = [
    { icon: Shield, title: translationsFeatures("trustless.title"), description: translationsFeatures("trustless.description") },
    { icon: Clock, title: translationsFeatures("timeLocked.title"), description: translationsFeatures("timeLocked.description") },
    { icon: Zap, title: translationsFeatures("gasEfficient.title"), description: translationsFeatures("gasEfficient.description") },
    { icon: Coins, title: translationsFeatures("multiToken.title"), description: translationsFeatures("multiToken.description") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="absolute inset-0 grid-pattern" />
          <div className="absolute top-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute inset-0 noise" />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <motion.div {...fadeInUp}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm">
                <Send className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary font-medium">Trustless Crypto Payments</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              {...fadeInUp}
            >
              {translations("paymentsTitle")}
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
              {...fadeInUp}
            >
              {translations("paymentsDesc")}
            </motion.p>

            <motion.div className="mt-8 flex justify-center gap-4" {...fadeInUp}>
              <Link href="/app">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                  {translations("paymentsButton")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative py-16 md:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl font-bold tracking-tight text-center sm:text-3xl mb-12">
              {translationsHowItWorks("title")}
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="relative rounded-2xl border border-border/40 bg-card p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {step.number}
                  </div>
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 mt-2">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="relative py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {translationsUseCases("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {translationsUseCases("subtitle")}
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  className="group rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <useCase.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{useCase.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{useCase.description}</p>
                  <div className="mt-4 rounded-lg bg-secondary/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">{translationsUseCases("exampleLabel")} </span>
                    <span className="text-xs font-medium">{useCase.example}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative py-20 md:py-32 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {translationsFeatures("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {translationsFeatures("subtitle")}
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="rounded-xl border border-border/40 bg-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-20 md:py-32">
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to send crypto with confidence?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No signup. No middleman. Just connect your wallet and lock funds.
            </p>
            <div className="mt-8">
              <Link href="/app">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                  {translations("paymentsButton")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
