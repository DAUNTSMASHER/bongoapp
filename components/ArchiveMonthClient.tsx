"use client";

import { useEffect, useState } from "react";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import PaginatedStoriesList from "@/components/PaginatedStoriesList";
import PageStuckBanner from "@/components/PageStuckBanner";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import { BANGLA_MONTHS } from "@/lib/stories";
import { usePageStuck } from "@/hooks/usePageStuck";
import type { Story } from "@/types/story";

function filterByMonth(stories: Story[], year: number, month: number): Story[] {
  return stories.filter((s) => {
    const d = s.publishedAt || s.createdAt;
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export default function ArchiveMonthClient({
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
    const [yearStr, monthStr] = slug.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    if (isNaN(year) || isNaN(month)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    getPublishedStoriesFromFirestore({ limitCount: 500 })
      .then((list) => {
        if (!cancelled) {
          const filtered = filterByMonth(list, year, month).sort(
            (a, b) =>
              (b.publishedAt?.getTime() ?? b.createdAt.getTime()) -
              (a.publishedAt?.getTime() ?? a.createdAt.getTime())
          );
          setStories(filtered);
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
          <BackButton href="/archive/" label="আর্কাইভ" />
        </div>
        <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
          আর্কাইভ — {label}
        </h1>
        <p className="font-bangla text-white/60">লোড হচ্ছে...</p>
        <PageStuckBanner show={stuck} onRefresh={() => window.location.reload()} />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/archive/" label="আর্কাইভ" />
      </div>
      <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
        আর্কাইভ — {label}
      </h1>
      <PaginatedStoriesList
        stories={stories}
        basePath={`/archive/${slug}/`}
        emptyMessage="এই মাসে কোনো গল্প নেই।"
      />
    </ContentWrapper>
  );
}
