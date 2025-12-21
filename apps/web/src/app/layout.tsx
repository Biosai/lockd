import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Lockd | Lock crypto for anyone",
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
  authors: [{ name: "Lockd" }],
  openGraph: {
    title: "Lockd | Lock crypto for anyone",
    description:
      "Lock crypto for anyone. Get it back if unclaimed. Trustless, on-chain.",
    type: "website",
    locale: "en_US",
    siteName: "Lockd",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lockd | Lock crypto for anyone",
    description:
      "Lock crypto for anyone. Get it back if unclaimed. Trustless, on-chain.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
