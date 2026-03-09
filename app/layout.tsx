import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdPopupProvider } from "@/components/AdPopupProvider";
import MobileShell from "@/components/MobileShell";
import JsonLdSchemas from "@/components/JsonLdSchemas";
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
  process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "bongochoti — বাংলা চটি গল্প ও ভিডিও | Bangla Choti Stories & Videos",
    template: "%s | bongochoti",
  },
  description:
    "bongochoti — বাংলা চটি গল্প ও sex video এর প্ল্যাটফর্ম। ১৮০০+ bangla choti golpo, ১০০০+ bangla porn video। প্রাপ্তবয়স্কদের জন্য। Bangla choti kahini পড়ুন ও ভিডিও দেখুন।",
  keywords: [
    "bangla choti",
    "বাংলা চটি",
    "bangla choti golpo",
    "choti kahini",
    "বাংলা চটি গল্প",
    "panu golpo",
    "bangla sex story",
    "bangla sex video",
    "বাংলা সেক্স ভিডিও",
    "bangla porn video",
    "বাংলা পর্ন ভিডিও",
    "sex video",
    "choti video",
    "bongochoti",
  ],
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
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
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
          <AdPopupProvider>
            <MobileShell>{children}</MobileShell>
          </AdPopupProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
