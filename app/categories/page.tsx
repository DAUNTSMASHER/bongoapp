import type { Metadata } from "next";
import CategoriesPageClient from "@/components/CategoriesPageClient";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "Bangla Choti বিভাগ | অজাচার, পরকিয়া, গৃহবধূ — ১৮+ ক্যাটাগরি",
  description:
    "Bangla choti বিভাগ — অজাচার, কাজের মেয়ে, গৃহবধূ, সেরা চটি, পরকিয়া। Browse ১৮০০+ bangla choti golpo by category. bongochoti.com",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/categories/` },
  openGraph: {
    title: "Bangla Choti বিভাগ | Bangla Choti Golpo Categories | bongochoti",
    description: "Browse bangla choti golpo, choti kahini by category. অজাচার, পরকিয়া, গৃহবধূ and more.",
    url: `${siteUrl}/categories/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Bangla Choti Categories | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "Bangla Choti বিভাগ | bongochoti" },
  robots: { index: true, follow: true },
};

export default function CategoriesPage() {
  return <CategoriesPageClient />;
}
