"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import HeroBanner from "./HeroBanner";
import ContentWrapper from "./ContentWrapper";
import { formatBanglaCount } from "@/lib/banglaNumbers";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import type { Story } from "@/types/story";

const HotChobiRail = dynamic(() => import("./HotChobiRail"), { ssr: true });
const HomeStats = dynamic(() => import("./HomeStats"), { ssr: true });
const CategoryChips = dynamic(() => import("./CategoryChips"), { ssr: true });
const TrendingRail = dynamic(() => import("./TrendingRail"), { ssr: true });
const LatestList = dynamic(() => import("./LatestList"), { ssr: true });
const AdSlot = dynamic(() => import("./AdSlot"), { ssr: false, loading: () => <div className="min-h-[90px]" /> });

interface HomePageClientProps {
  /** Server-fetched stories so initial HTML has content (SEO). */
  initialStories: Story[];
}

/** Split stories so each appears only once: hero (1), trending (3), latest (rest). */
function splitStoriesForHome(stories: Story[]): {
  hero: Story | null;
  trending: Story[];
  latest: Story[];
} {
  if (stories.length === 0) return { hero: null, trending: [], latest: [] };
  const hero = stories[0] ?? null;
  const trending = stories.slice(1, 4);
  const latest = stories.slice(4);
  return { hero, trending, latest };
}

export default function HomePageClient({ initialStories }: HomePageClientProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [loading, setLoading] = useState(initialStories.length === 0);

  useEffect(() => {
    if (initialStories.length > 0) return;
    let cancelled = false;
    getPublishedStoriesFromFirestore({ limitCount: 50 })
      .then((s) => {
        if (!cancelled) {
          setStories(s);
          setLoading(false);
        }
      })
      .catch(async () => {
        if (cancelled) return;
        try {
          const res = await fetch("/api/stories?limit=50");
          const data = await res.json();
          if (res.ok && Array.isArray(data?.stories) && data.stories.length > 0) {
            const list = data.stories.map((s: { createdAt?: string; updatedAt?: string; publishedAt?: string } & Record<string, unknown>) => {
              const copy = { ...s } as Record<string, unknown>;
              if (copy.createdAt && typeof copy.createdAt === "string") copy.createdAt = new Date(copy.createdAt);
              if (copy.updatedAt && typeof copy.updatedAt === "string") copy.updatedAt = new Date(copy.updatedAt);
              if (copy.publishedAt && typeof copy.publishedAt === "string") copy.publishedAt = new Date(copy.publishedAt);
              return copy as unknown as Story;
            });
            if (!cancelled) setStories(list);
          }
        } catch { /* no-op */ }
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [initialStories.length]);

  const { hero: heroStory, trending, latest } = splitStoriesForHome(stories);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">কোনো গল্প পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {heroStory && <HeroBanner story={heroStory} />}
      <ContentWrapper className="pt-2 md:pt-4 lg:pt-6">
        {/* SEO: keyword-rich intro — Netflix-style card */}
        <section className="netflix-section mb-6 rounded-lg px-4 py-6 md:px-6 md:py-7">
          <h1 className="font-bangla text-xl font-bold text-white md:text-2xl">
            আপনাকে স্বাগতম bongochoti.online এ
          </h1>
          <p className="font-bangla mt-3 text-sm leading-relaxed text-white/80 md:text-base">
            bongochoti তে <strong className="text-white/95">free bangla choti</strong> ও <strong className="text-white/95">real bangla leaked mms</strong> পাবেন
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span className="font-bangla flex items-baseline gap-1">
              <span className="text-4xl font-bold tabular-nums text-white md:text-5xl">{formatBanglaCount(1000)}</span>
              <span className="text-base text-white/80 md:text-lg">গল্প</span>
            </span>
            <span className="font-bangla flex items-baseline gap-1">
              <span className="text-4xl font-bold tabular-nums text-white md:text-5xl">{formatBanglaCount(1000)}</span>
              <span className="text-base text-white/80 md:text-lg">ভিডিও</span>
            </span>
          </div>
          <a
            href="/about/"
            className="font-bangla mt-5 inline-block rounded-md border border-white/10 bg-transparent px-4 py-2.5 text-sm text-white/90 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
          >
            আমাদের সম্পর্কে
          </a>
        </section>
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6 xl:gap-8">
          <div>
            <CategoryChips />
            <HotChobiRail />
            <AdSlot placement="home-top" />
            {trending.length > 0 && <TrendingRail stories={trending} />}
            {latest.length > 0 && <LatestList initialStories={latest} />}
          </div>
          <aside className="mt-6 lg:mt-0 lg:sticky lg:top-4 lg:self-start lg:pt-0">
            <HomeStats storyCount={1000} videoCount={1000} />
          </aside>
        </div>
      </ContentWrapper>
    </div>
  );
}
