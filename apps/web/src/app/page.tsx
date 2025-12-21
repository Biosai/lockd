"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { LogoMinimal } from "@/components/ui/logo";
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
                  Open Source & Trustless
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeInUp}
                className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Lock crypto for anyone.{" "}
                <span className="gradient-text">Get it back</span> if unclaimed.
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeInUp}
                className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
              >
                The trustless way to send crypto. Lock funds for a recipient with
                automatic refund protection. No middleman, purely on-chain.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <Link href="/app">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                    Launch App
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/your-username/lokd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    View on GitHub
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
                  <span>Open Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Non-Custodial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Fully On-Chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>ETH & ERC20</span>
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
                How it Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simple, secure, and straightforward
              </p>
            </motion.div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Lock,
                  title: "Lock Funds",
                  description:
                    "Lock ETH or any ERC20 token for a specific recipient address. Set a deadline for claiming.",
                },
                {
                  step: "02",
                  icon: Users,
                  title: "Share the Link",
                  description:
                    "Send the claim link to your recipient. They can claim anytime before or after the deadline.",
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "Claim or Refund",
                  description:
                    "Recipient claims the funds, or you reclaim them after the deadline. You're always protected.",
                },
              ].map((item, index) => (
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
                Built for Trust
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Security and simplicity at the core
              </p>
            </motion.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Shield,
                  title: "Trustless",
                  description: "No middleman, purely on-chain smart contracts",
                },
                {
                  icon: Clock,
                  title: "Time-Locked",
                  description: "Automatic refund protection after deadline",
                },
                {
                  icon: Zap,
                  title: "Gas Efficient",
                  description: "Optimized for minimal transaction costs",
                },
                {
                  icon: Coins,
                  title: "Multi-Token",
                  description: "Supports ETH and any ERC20 token",
                },
              ].map((feature, index) => (
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
                Use Cases
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From payments to bounties, Lokd adapts to your needs
              </p>
            </motion.div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Freelance Payments",
                  description:
                    "Lock payment for a designer or developer. They claim when work is delivered. If not delivered, refund after deadline.",
                  example: "Pay 500 USDC for a logo design",
                },
                {
                  icon: Target,
                  title: "Bounties & Rewards",
                  description:
                    "Lock a bounty for whoever fixes a bug or completes a task. Assign it to the contributor who delivers.",
                  example: "1 ETH bounty for security audit",
                },
                {
                  icon: Users,
                  title: "P2P Offers",
                  description:
                    "Make a trustless offer for an NFT or service. Seller claims to accept the deal, or you reclaim your funds.",
                  example: "Offer 2 ETH for a rare NFT",
                },
                {
                  icon: Gift,
                  title: "Crypto Gifts",
                  description:
                    "Send birthday ETH to a friend. If they don't set up a wallet in time, reclaim it after the deadline.",
                  example: "Gift 0.1 ETH for a birthday",
                },
                {
                  icon: Coins,
                  title: "Invoice Payments",
                  description:
                    "Send an invoice link. Client deposits the payment, you claim upon delivering the service.",
                  example: "Invoice for consulting services",
                },
                {
                  icon: Shield,
                  title: "Escrow Agreements",
                  description:
                    "Lock funds for any conditional agreement. The recipient claims when conditions are met.",
                  example: "Escrow for domain purchase",
                },
              ].map((useCase, index) => (
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
                      Example:{" "}
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
                Ready to lock crypto with confidence?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start using Lokd today. No signup required, just connect your
                wallet.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/app">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                    Launch App
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/your-username/lokd"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2">
                    <Github className="h-4 w-4" />
                    Star on GitHub
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
