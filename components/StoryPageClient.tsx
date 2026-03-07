"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import StoryReader from "@/components/StoryReader";
import { getPublishedStoryByIdFromFirestore } from "@/lib/firestoreStoriesClient";
import type { Story } from "@/types/story";

export default function StoryPageClient({ id }: { id: string }) {
  const [story, setStory] = useState<Story | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    getPublishedStoryByIdFromFirestore(id)
      .then((s) => {
        if (!cancelled) setStory(s);
      })
      .catch(() => {
        if (!cancelled) setStory(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (story === "loading") {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!story) notFound();

  return <StoryReader story={story} />;
}
