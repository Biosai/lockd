import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { mainnetConfig } from "@/lib/wagmi";

const GTM_ID = "GTM-5X84SCQ8";
const GA_ID = "G-NB5MV9B2NX";

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
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  const initialState = cookieToInitialState(mainnetConfig, cookie);

  return (
    <html lang={locale} className="dark">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          <Providers initialState={initialState}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
