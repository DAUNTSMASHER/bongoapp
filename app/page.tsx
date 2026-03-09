import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { getPublishedStories } from "@/lib/storyData";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bongochoti.online";

/** ISR: revalidate every 60s to reduce TTFB (document latency). Data is cached in unstable_cache. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bangla Choti | বাংলা চটি গল্প ও Sex Video | ১৮০০+ গল্প, ১০০০+ ভিডিও",
  description:
    "Bangla choti golpo ও sex video — ১৮০০+ বাংলা চটি গল্প, ১০০০+ bangla porn video। প্রাপ্তবয়স্কদের জন্য। Read bangla choti kahini, watch bangla sex video online.",
  keywords: [
    "bangla choti",
    "বাংলা চটি",
    "choti golpo",
    "bangla choti golpo",
    "sex video",
    "bangla sex video",
    "bangla porn video",
    "বাংলা পর্ন ভিডিও",
    "choti kahini",
    "choti video",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Bangla Choti & Sex Video | বাংলা চটি গল্প ও ভিডিও | bongochoti",
    description: "১৮০০+ bangla choti golpo, ১০০০+ bangla sex video। Read choti kahini, watch porn video. Bengali adult stories.",
    url: `${siteUrl}/`,
    type: "website",
    images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "bongochoti — বাংলা চটি" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangla Choti | Sex Video | বাংলা চটি | bongochoti",
    description: "১৮০০+ bangla choti, ১০০০+ sex video। Read & watch.",
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
