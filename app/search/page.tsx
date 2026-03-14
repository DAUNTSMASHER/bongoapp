import type { Metadata } from "next";
import SearchPageClient from "@/components/SearchPageClient";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "Bangla Choti সার্চ | গল্প ও ভিডিও খুঁজুন",
  description:
    "Bangla choti golpo, choti kahini, bangla sex video সার্চ করুন। ১৮০০+ গল্প, ১০০০+ ভিডিও — Search bangla choti stories and videos. bongochoti.com",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/search/` },
  openGraph: {
    title: "Bangla Choti সার্চ | Search Bangla Choti | bongochoti",
    description: "Search bangla choti golpo, choti kahini, bangla sex video. ১৮০০+ stories, ১০০০+ videos.",
    url: `${siteUrl}/search/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Bangla Choti Search | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "Bangla Choti সার্চ | bongochoti" },
  robots: { index: true, follow: true },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <SearchPageClient />
    </div>
  );
}
