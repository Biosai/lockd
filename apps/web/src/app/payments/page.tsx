import type { Metadata } from "next";
import { PaymentsLandingContent } from "./content";

export const metadata: Metadata = {
  title: "Lockd Payments | Trustless Crypto Escrow",
  description:
    "Send crypto with automatic refund protection. Lock ETH or ERC20 tokens for a recipient with a deadline. They claim, or you get it back. No middleman.",
  openGraph: {
    title: "Lockd Payments | Trustless Crypto Escrow",
    description:
      "Lock crypto for anyone. Recipient claims, or you refund after the deadline. Trustless, on-chain.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lockd Payments — Trustless crypto escrow" }],
  },
};

export default function PaymentsLandingPage() {
  return <PaymentsLandingContent />;
}
