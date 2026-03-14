import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { getPublishedStories } from "@/lib/storyData";
import { SEO_KEYWORDS } from "@/lib/seoKeywords";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.com";

/** ISR: revalidate every 60s to reduce TTFB (document latency). Data is cached in unstable_cache. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bangla Choti | বাংলা চটি গল্প ও Sex Video | ১৮০০+ Golpo, ১০০০+ Video",
  description:
    "Bangla choti — Read ১৮০০+ bangla choti golpo, choti kahini online. ১০০০+ bangla sex video, bangla porn video. বাংলা চটি গল্প free. bongochoti.com.",
  keywords: SEO_KEYWORDS,
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Bangla Choti | বাংলা চটি গল্প ও Sex Video | bongochoti",
    description: "১৮০০+ bangla choti golpo, ১০০০+ bangla sex video। Read bangla choti kahini, watch bangla porn video. Free bangla choti online.",
    url: `${siteUrl}/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Bangla Choti | bongochoti — বাংলা চটি গল্প" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangla Choti | বাংলা চটি গল্প ও Sex Video | bongochoti",
    description: "১৮০০+ bangla choti golpo, ১০০০+ bangla sex video. Free bangla choti.",
  },
};

export default async function HomePage() {
  let stories: Awaited<ReturnType<typeof getPublishedStories>> = [];
  try {
    stories = await getPublishedStories({ limit: 50 });
  } catch {
    // Firebase may not be configured (e.g. build without env)
  }
  return <HomePageClient initialStories={stories} />;
}
