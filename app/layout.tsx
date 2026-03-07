import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import MobileShell from "@/components/MobileShell";
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

export const metadata: Metadata = {
  title: "bongochoti — Read Stories",
  description: "Read stories in Bangla, Hindi, and English. Mobile-first, comfortable reading.",
  icons: { icon: "/logo.png" },
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
  return (
    <html lang="bn" className="theme-netflix" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <ThemeProvider>
          <MobileShell>{children}</MobileShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
