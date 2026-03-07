"use client";

import { useEffect, useState } from "react";
import HeroBanner from "./HeroBanner";
import TrendingRail from "./TrendingRail";
import LatestList from "./LatestList";
import CategoryChips from "./CategoryChips";
import ContentWrapper from "./ContentWrapper";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import type { Story } from "@/types/story";

export default function HomePageClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublishedStoriesFromFirestore({ limitCount: 50 })
      .then((list) => {
        if (!cancelled) {
          const sorted = list.sort(
            (a, b) =>
              (b.publishedAt?.getTime() ?? b.createdAt.getTime()) -
              (a.publishedAt?.getTime() ?? a.createdAt.getTime())
          );
          setStories(sorted);
        }
      })
      .catch(() => {
        if (!cancelled) setStories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trending = stories.slice(0, 3);
  const latest = stories;
  const heroStory = trending[0];

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {heroStory && <HeroBanner story={heroStory} />}
      <ContentWrapper className="pt-2 md:pt-4 lg:pt-6">
        <CategoryChips />
        <TrendingRail stories={trending} />
        <LatestList initialStories={latest} />
      </ContentWrapper>
    </div>
  );
}
