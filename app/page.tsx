import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { getPublishedStories } from "@/lib/storyData";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

/** ISR: revalidate every 60s to reduce TTFB (document latency). Data is cached in unstable_cache. */
export const revalidate = 59;

export const metadata: Metadata = {
  title: "Bangla Choti | বাংলা চটি গল্প, Sex Video ও ১৮+ কাহিনী | bongochoti",
  description:
    "Bangla choti — ১৮০০+ বাংলা চটি গল্প, choti kahini পড়ুন অনলাইনে। ১০০০+ bangla sex video, bangla porn video দেখুন। সেরা বাংলা চটি সাইট। bongochoti.com.",
  keywords: SEO_KEYWORDS,
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Bangla Choti | বাংলা চটি গল্প ও Sex Video | bongochoti",
    description: "১৮০০+ বাংলা চটি গল্প, ১০০০+ বাংলা সেক্স ভিডিও। পড়ুন বাংলা চটি কাহিনী, দেখুন গরম ভিডিও। ফ্রি অনলাইন।",
    url: `${siteUrl}/`,
    siteName: "bongochoti",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Bangla Choti | bongochoti — বাংলা চটি গল্প",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangla Choti | বাংলা চটি গল্প, Sex Video ও ১৮+ কাহিনী | bongochoti",
    description: "১৮০০+ বাংলা চটি গল্প, ১০০০+ bangla sex video পড়ুন এবং দেখুন একদম ফ্রিতে।",
  },
};

export default async function HomePage() {
  let stories: Awaited<ReturnType<typeof getPublishedStories>> = [];
  try {
    stories = await getPublishedStories({ limit: 50 });
  } catch {
    // Firebase may not be configured (e.g. build without env)
  }
  return (
    <>
      {/* Server-rendered H1 for SEO tools (content also visible in client intro) */}
      <h1 className="sr-only">
        Bangla Choti | বাংলা চটি গল্প, Sex Video ও ১৮+ কাহিনী — bongochoti
      </h1>
      <HomePageClient initialStories={stories} />
    </>
  );
}
