"use client";

import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import PaginatedStoriesList from "@/components/PaginatedStoriesList";
import PageStuckBanner from "@/components/PageStuckBanner";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import { usePageStuck } from "@/hooks/usePageStuck";
import type { Story } from "@/types/story";

export default function AllStoriesPageClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const stuck = usePageStuck(loading, 5500);

  useEffect(() => {
    let cancelled = false;
    getPublishedStoriesFromFirestore({ limitCount: 200 })
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
      .catch(async () => {
        if (cancelled) return;
        try {
          const res = await fetch("/api/stories?limit=200");
          const data = await res.json();
          if (res.ok && Array.isArray(data?.stories) && data.stories.length > 0) {
            const list = data.stories.map((s: { createdAt?: string; updatedAt?: string; publishedAt?: string } & Record<string, unknown>) => {
              const copy = { ...s } as Record<string, unknown>;
              if (copy.createdAt && typeof copy.createdAt === "string") copy.createdAt = new Date(copy.createdAt);
              if (copy.updatedAt && typeof copy.updatedAt === "string") copy.updatedAt = new Date(copy.updatedAt);
              if (copy.publishedAt && typeof copy.publishedAt === "string") copy.publishedAt = new Date(copy.publishedAt);
              return copy as unknown as Story;
            });
            list.sort(
              (a: Story, b: Story) =>
                (b.publishedAt?.getTime() ?? b.createdAt.getTime()) -
                (a.publishedAt?.getTime() ?? a.createdAt.getTime())
            );
            if (!cancelled) setStories(list);
          }
        } catch {
          /* no-op */
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <ContentWrapper className="min-h-screen py-6 md:py-8">
        <div className="mb-6 flex items-center gap-4">
          <BackButton href="/" label="হোম" />
        </div>
        <h1 className="mb-6 font-bangla text-2xl font-bold text-white md:text-3xl">সব গল্প</h1>
        <p className="font-bangla text-white/60">লোড হচ্ছে...</p>
        <PageStuckBanner show={stuck} onRefresh={() => window.location.reload()} />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <h1 className="mb-2 font-bangla text-2xl font-bold text-white md:text-3xl">সব গল্প</h1>
      <p className="mb-6 font-bangla text-sm text-white/70">
        প্রকাশিত সব বাংলা চটি গল্প — ক্যাটাগরি নির্বিশেষে
      </p>
      <PaginatedStoriesList
        stories={stories}
        basePath="/stories/"
        emptyMessage="এখনও কোন গল্প প্রকাশিত হয়নি।"
      />
    </ContentWrapper>
  );
}
