"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import PageStuckBanner from "@/components/PageStuckBanner";
import { getPublishedStoryByIdFromFirestore } from "@/lib/firestoreStoriesClient";
import { usePageStuck } from "@/hooks/usePageStuck";
import type { Story } from "@/types/story";

export default function StoryPageClient({ id }: { id: string }) {
  const [story, setStory] = useState<Story | null | "loading">("loading");
  const stuck = usePageStuck(story === "loading", 5500);

  useEffect(() => {
    let cancelled = false;
    getPublishedStoryByIdFromFirestore(id)
      .then((s) => {
        if (!cancelled) setStory(s ?? null);
      })
      .catch(async () => {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/stories/${id}`);
          const data = await res.json();
          if (res.ok && data?.story) {
            const s = data.story;
            if (s.createdAt && typeof s.createdAt === "string") s.createdAt = new Date(s.createdAt);
            if (s.updatedAt && typeof s.updatedAt === "string") s.updatedAt = new Date(s.updatedAt);
            if (s.publishedAt && typeof s.publishedAt === "string") s.publishedAt = new Date(s.publishedAt);
            setStory(s);
          } else {
            setStory(null);
          }
        } catch {
          setStory(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (story === "loading") {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">লোড হচ্ছে...</p>
        <PageStuckBanner show={stuck} onRefresh={() => window.location.reload()} />
      </div>
    );
  }

  if (!story) notFound();

  return <StoryReader story={story} />;
}
