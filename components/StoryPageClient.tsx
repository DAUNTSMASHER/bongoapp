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
    async function load() {
      try {
        let s = await getPublishedStoryByIdFromFirestore(id);
        if (s && !cancelled) {
          setStory(s);
          return;
        }
        // Firestore returned null or failed — try API (works better for Unicode IDs and serverless)
        const res = await fetch(`/api/stories/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data?.story) {
          const storyData = data.story;
          if (storyData.createdAt && typeof storyData.createdAt === "string") storyData.createdAt = new Date(storyData.createdAt);
          if (storyData.updatedAt && typeof storyData.updatedAt === "string") storyData.updatedAt = new Date(storyData.updatedAt);
          if (storyData.publishedAt && typeof storyData.publishedAt === "string") storyData.publishedAt = new Date(storyData.publishedAt);
          setStory(storyData);
        } else {
          setStory(null);
        }
      } catch {
        if (!cancelled) setStory(null);
      }
    }
    load();
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
