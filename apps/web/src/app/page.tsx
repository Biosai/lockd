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
  Users,
  Gift,
  FileText,
  Target,
  Github,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useTranslations } from "next-intl";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const t = useTranslations("home");
  const tHowItWorks = useTranslations("howItWorks");
  const tFeatures = useTranslations("features");
  const tUseCases = useTranslations("useCases");
  const tCta = useTranslations("cta");

  const howItWorksSteps = [
    {
      step: tHowItWorks("step1.number"),
      icon: Lock,
      title: tHowItWorks("step1.title"),
      description: tHowItWorks("step1.description"),
    },
    {
      step: tHowItWorks("step2.number"),
      icon: Users,
      title: tHowItWorks("step2.title"),
      description: tHowItWorks("step2.description"),
    },
    {
      step: tHowItWorks("step3.number"),
      icon: Shield,
      title: tHowItWorks("step3.title"),
      description: tHowItWorks("step3.description"),
    },
  ];

  const features = [
    {
      icon: Shield,
      title: tFeatures("trustless.title"),
      description: tFeatures("trustless.description"),
    },
    {
      icon: Clock,
      title: tFeatures("timeLocked.title"),
      description: tFeatures("timeLocked.description"),
    },
    {
      icon: Zap,
      title: tFeatures("gasEfficient.title"),
      description: tFeatures("gasEfficient.description"),
    },
    {
      icon: Coins,
      title: tFeatures("multiToken.title"),
      description: tFeatures("multiToken.description"),
    },
  ];

  const useCases = [
    {
      icon: FileText,
      title: tUseCases("freelance.title"),
      description: tUseCases("freelance.description"),
      example: tUseCases("freelance.example"),
    },
    {
      icon: Target,
      title: tUseCases("bounties.title"),
      description: tUseCases("bounties.description"),
      example: tUseCases("bounties.example"),
    },
    {
      icon: Users,
      title: tUseCases("p2p.title"),
      description: tUseCases("p2p.description"),
      example: tUseCases("p2p.example"),
    },
    {
      icon: Gift,
      title: tUseCases("gifts.title"),
      description: tUseCases("gifts.description"),
      example: tUseCases("gifts.example"),
    },
    {
      icon: Coins,
      title: tUseCases("invoices.title"),
      description: tUseCases("invoices.description"),
      example: tUseCases("invoices.example"),
    },
    {
      icon: Shield,
      title: tUseCases("escrow.title"),
      description: tUseCases("escrow.description"),
      example: tUseCases("escrow.example"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
          {/* Background Effects */}
          <div className="absolute inset-0 grid-pattern" />
          <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute inset-0 noise" />

          <div className="relative mx-auto max-w-7xl px-6">
            <motion.div
              className="flex flex-col items-center text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div
                variants={fadeInUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 text-sm backdrop-blur-sm"
              >
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">
                  {t("badge")}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeInUp}
                className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {t("heading")}{" "}
                <span className="gradient-text">{t("headingHighlight")}</span> {t("headingEnd")}
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeInUp}
                className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
              >
                {t("subheading")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <Link href="/app">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                    {t("launchApp")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/Biosai/lockd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    {t("viewOnGithub")}
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={fadeInUp}
                className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{t("openSource")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{t("nonCustodial")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{t("fullyOnChain")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{t("ethErc20")}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {tHowItWorks("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {tHowItWorks("subtitle")}
              </p>
            </motion.div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {howItWorksSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="glass rounded-2xl p-8 transition-all duration-300 hover:border-primary/30">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-5xl font-bold text-primary/20">
                        {item.step}
                      </span>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 md:py-32 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {tFeatures("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {tFeatures("subtitle")}
              </p>
            </motion.div>

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
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="relative py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {tUseCases("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {tUseCases("subtitle")}
              </p>
            </motion.div>

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
                  <p className="mt-2 text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                  <div className="mt-4 rounded-lg bg-secondary/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      {tUseCases("exampleLabel")}{" "}
                    </span>
                    <span className="text-xs font-medium">{useCase.example}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {tCta("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {tCta("subtitle")}
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/app">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                    {t("launchApp")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/Biosai/lockd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    {t("starOnGithub")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
