"use client";

import { useEffect, useState } from "react";
import SearchContent from "@/components/SearchContent";
import { getPublishedStoriesFromFirestore } from "@/lib/firestoreStoriesClient";
import type { Story } from "@/types/story";

export default function SearchPageClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPublishedStoriesFromFirestore({ limitCount: 200 })
      .then((list) => {
        if (!cancelled) setStories(list);
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

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <p className="font-bangla text-white/70">লোড হচ্ছে...</p>
      </div>
    );
  }

  return <SearchContent initialStories={stories} />;
}
