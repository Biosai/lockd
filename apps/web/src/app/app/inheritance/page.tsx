"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, ArrowRight } from "lucide-react";

export default function AppInheritancePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <CalendarClock className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold">Crypto Inheritance</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Set up trustless inheritance plans with a dead man&#39;s switch.
          Check in periodically to prove you&#39;re active. If you stop, your assets go to the right people.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Smart contract ready &mdash; UI coming soon
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/inheritance">
            <Button variant="outline" className="gap-2">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://t.me/lockd_official" target="_blank">
            <Button className="gap-2">Get Notified</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
