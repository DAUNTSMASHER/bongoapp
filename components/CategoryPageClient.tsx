"use client";

import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import PaginatedStoriesList from "@/components/PaginatedStoriesList";
import PageStuckBanner from "@/components/PageStuckBanner";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import { usePageStuck } from "@/hooks/usePageStuck";
import type { Story } from "@/types/story";

export default function CategoryPageClient({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const stuck = usePageStuck(loading, 5500);

  useEffect(() => {
    let cancelled = false;
    getPublishedStoriesFromFirestore({ categorySlug: slug, limitCount: 100 })
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
  }, [slug]);

  if (loading) {
    return (
      <ContentWrapper className="min-h-screen py-6 md:py-8">
        <div className="mb-6 flex items-center gap-4">
          <BackButton href="/categories/" label="ক্যাটাগরি" />
        </div>
        <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">{label}</h1>
        <p className="font-bangla text-white/60">লোড হচ্ছে...</p>
        <PageStuckBanner show={stuck} onRefresh={() => window.location.reload()} />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/categories/" label="ক্যাটাগরি" />
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white md:text-3xl">{label}</h1>
      <PaginatedStoriesList
        stories={stories}
        basePath={`/categories/${slug}/`}
        emptyMessage="এই ক্যাটাগরিতে এখনও গল্প নেই।"
      />
    </ContentWrapper>
  );
}
