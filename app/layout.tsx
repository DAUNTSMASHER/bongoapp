import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdPopupProvider } from "@/components/AdPopupProvider";
import MobileShell from "@/components/MobileShell";
import AgeGate from "@/components/AgeGate";
import JsonLdSchemas from "@/components/JsonLdSchemas";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";
import "./globals.css";

/* Bangla font: Kalpurush (local) */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bangla Choti | বাংলা চটি গল্প ও Sex Video",
    template: "%s | Bangla Choti | bongochoti",
  },
  description:
    "Bangla choti — ১৮০০+ bangla choti golpo, choti kahini পড়ুন। ১০০০+ bangla sex video। বাংলা চটি গল্প, panu golpo, bangla porn video। Free bangla choti online.",
  keywords: SEO_KEYWORDS,
  authors: [{ name: "bongochoti", url: siteUrl }],
  creator: "bongochoti",
  publisher: "bongochoti",
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "bongochoti",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    site: "@bongochoti",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "48x48", type: "image/png" },
      { url: "/logo.png", sizes: "96x96", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  other: {
    "ff0cd477e93924b16d229267d474a387e72ca672": "ff0cd477e93924b16d229267d474a387e72ca672",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="bn" className="theme-netflix" suppressHydrationWarning>
      {/* Preconnect to LCP image origins for faster hero load */}
      <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      <link rel="dns-prefetch" href="https://cardinaltangible.com" />
      <link rel="icon" href={`${siteUrl}/logo.png`} sizes="48x48" type="image/png" />
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="lazyOnload"
          />
          <Script id="ga4" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {/* Cardinal Tangible pop ad — 10+ placements for maximum earning */}
      <Script
        id="cardinal-pop-ad"
        src="https://cardinaltangible.com/a5/4d/29/a54d29b3db00d91e488dcab4d2374e82.js"
        strategy="lazyOnload"
        data-cfasync="false"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <link
          rel="preload"
          href="/fonts/kalpurush.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <JsonLdSchemas />
        <ThemeProvider>
          <AgeGate />
          <AdPopupProvider>
            <AnalyticsTracker />
            <MobileShell>{children}</MobileShell>
          </AdPopupProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
