"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import BackButton from "@/components/BackButton";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import { CATEGORIES } from "@/lib/stories";

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CategoriesPageClient() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    getPublishedStoriesFromFirestore({ limitCount: 500 })
      .then((stories) => {
        if (cancelled) return;
        const byCategory: Record<string, number> = {};
        CATEGORIES.forEach((c) => {
          byCategory[c.slug] = 0;
        });
        stories.forEach((s) => {
          const slug = s.categorySlug || "uncategorized";
          byCategory[slug] = (byCategory[slug] ?? 0) + 1;
        });
        setCounts(byCategory);
      })
      .catch(() => {
        if (!cancelled) setCounts({});
      });
  }, []);

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
        ক্যাটাগরি
      </h1>
      <div className="space-y-1">
        {CATEGORIES.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/categories/${slug}/`}
            className="font-bangla block rounded-lg border border-white/10 bg-[#181818] px-4 py-3 text-base font-medium text-white transition-all hover:bg-primary hover:border-primary active:scale-[0.99] md:px-5 md:py-4 md:text-lg"
          >
            {label} ({formatCount(counts[slug] ?? 0)})
          </Link>
        ))}
      </div>
    </ContentWrapper>
  );
}
