"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Shield, Users, FileText, Key, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function InheritancePage() {
  const features = [
    {
      icon: Clock,
      title: "Dead Man's Switch",
      description: "Set up automatic check-ins. If you stop checking in, your beneficiaries can claim after the deadline.",
    },
    {
      icon: Users,
      title: "Multiple Beneficiaries",
      description: "Create batch deposits to split your inheritance between multiple heirs with custom amounts.",
    },
    {
      icon: Key,
      title: "Secret-Based Claiming",
      description: "Beneficiaries don't need a wallet address upfront. Share a secret phrase they can use to claim later.",
    },
    {
      icon: FileText,
      title: "Document Certification",
      description: "Attach a cryptographic hash of your will or instructions. Proves the document existed at creation time.",
    },
    {
      icon: Bell,
      title: "Time-Locked Claiming",
      description: "Set a start time when beneficiaries can begin claiming. Useful for delayed inheritance plans.",
    },
    {
      icon: Shield,
      title: "Fully On-Chain",
      description: "No backend, no database. Everything runs on Ethereum smart contracts. Trustless and transparent.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Inheritance Plan",
      description: "Deposit ETH or tokens with a deadline (e.g., 1 year). Optionally attach a document hash and set beneficiary addresses or secrets.",
    },
    {
      step: "02",
      title: "Regular Check-ins",
      description: "Extend the deadline periodically (e.g., every 6 months) to prove you're still active. This resets the clock.",
    },
    {
      step: "03",
      title: "Beneficiaries Claim",
      description: "If you stop checking in and the deadline passes, your beneficiaries can claim their share using their wallet or secret phrase.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Shield className="h-4 w-4" />
            Crypto Inheritance Made Simple
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Secure Your Crypto Legacy
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            Create trustless inheritance plans for your digital assets. Your beneficiaries can claim
            if you stop checking in. No lawyers, no banks, just smart contracts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/app/inheritance">
              <Button size="lg" className="gap-2">
                Launch App
              </Button>
            </Link>
            <Link href="https://t.me/lockd_official" target="_blank">
              <Button size="lg" variant="outline">
                Get Notified on Telegram
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Features</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to create a bulletproof crypto inheritance plan
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card/50">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to secure your crypto inheritance
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contract Status */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold">Smart Contract Ready</h3>
                    <p className="text-muted-foreground">
                      CryptoInheritance.sol has been developed and audited. 72 tests passing.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link href="https://github.com/Biosai/lockd/blob/main/contracts/CryptoInheritance.sol" target="_blank">
                    <Button variant="outline">View Contract</Button>
                  </Link>
                  <Link href="https://github.com/Biosai/lockd/blob/main/reports/audit-report.md" target="_blank">
                    <Button variant="outline">View Audit Report</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Coming Soon Banner */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Full UI Coming Soon
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              The smart contract is ready and audited. We&apos;re building a beautiful interface
              to make creating and managing inheritance plans as simple as possible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="https://t.me/lockd_official" target="_blank">
                <Button>
                  Get Notified on Telegram
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
