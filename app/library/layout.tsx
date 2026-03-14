import type { Metadata } from "next";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "লাইব্রেরি | আপনার দেখা Bangla Sex Video তালিকা | bongochoti",
  description:
    "আপনার দেখা bangla choti, bangla sex video তালিকা। Save watched videos, continue watching. bongochoti.com",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/library/` },
  openGraph: {
    title: "লাইব্রেরি | Bangla Sex Video Library | bongochoti",
    description: "Your watched bangla sex video list. Save and continue watching.",
    url: `${siteUrl}/library/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Library | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "লাইব্রেরি | bongochoti" },
  robots: { index: true, follow: true },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
