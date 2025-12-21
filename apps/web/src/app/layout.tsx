import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Lokd | Lock crypto for anyone",
  description:
    "The trustless way to send crypto. Lock funds for a recipient with automatic refund protection. No middleman, purely on-chain.",
  keywords: [
    "crypto",
    "escrow",
    "ethereum",
    "payments",
    "defi",
    "web3",
    "trustless",
    "lock",
  ],
  authors: [{ name: "Lokd" }],
  openGraph: {
    title: "Lokd | Lock crypto for anyone",
    description:
      "Lock crypto for anyone. Get it back if unclaimed. Trustless, on-chain.",
    type: "website",
    locale: "en_US",
    siteName: "Lokd",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokd | Lock crypto for anyone",
    description:
      "Lock crypto for anyone. Get it back if unclaimed. Trustless, on-chain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
