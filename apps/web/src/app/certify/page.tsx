import type { Metadata } from "next";
import { CertifyLandingContent } from "./content";

export const metadata: Metadata = {
  title: "Lockd Certify | Blockchain File Certification",
  description:
    "Create tamper-proof proof that a file existed at a specific point in time. Hash stored on-chain, file stays private. Perfect for IP, contracts, and evidence.",
  openGraph: {
    title: "Lockd Certify | Blockchain File Certification",
    description:
      "Create immutable proof of file existence on the blockchain. Your file never leaves your device.",
  },
};

export default function CertifyLandingPage() {
  return <CertifyLandingContent />;
}
