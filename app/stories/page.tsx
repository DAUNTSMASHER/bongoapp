import type { Metadata } from "next";
import AllStoriesPageClient from "@/components/AllStoriesPageClient";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

export const metadata: Metadata = {
  title: "Bangla Choti — সব গল্প | ১৮০০+ Bangla Choti Golpo, Choti Kahini",
  description:
    "পড়ুন সব bangla choti গল্প। ১৮০০+ bangla choti golpo, choti kahini, panu golpo — ক্যাটাগরি নির্বিশেষে। All bangla choti stories in one place. bongochoti.",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${siteUrl}/stories/` },
  openGraph: {
    title: "Bangla Choti — সব গল্প | Bangla Choti Golpo | bongochoti",
    description: "১৮০০+ bangla choti golpo, choti kahini পড়ুন। All bangla choti stories.",
    url: `${siteUrl}/stories/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Bangla Choti Golpo | bongochoti" }],
  },
  twitter: { card: "summary_large_image", title: "Bangla Choti — সব গল্প" },
  robots: { index: true, follow: true },
};

export default function AllStoriesPage() {
  return <AllStoriesPageClient />;
}
