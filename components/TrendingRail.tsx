"use client";

import StoryCard from "./StoryCard";
import type { Story } from "@/types/story";

interface TrendingRailProps {
  stories: Story[];
}

export default function TrendingRail({ stories }: TrendingRailProps) {
  if (stories.length === 0) return null;

  return (
    <section
      className="netflix-section section-py rounded-lg px-4 py-6 md:px-5 md:py-7"
      aria-label="Trending bangla choti"
    >
      <div className="mb-4 flex items-center gap-3 md:mb-5">
        <h2 className="font-bangla text-lg font-bold tracking-tight text-white md:text-xl lg:text-2xl">
          Trending Bangla Choti
        </h2>
      </div>
      {/* 2 cols on mobile, 4 on desktop, no scroll */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-5">
        {stories.map((story, i) => (
          <div key={story.id} className="min-h-0">
            <StoryCard story={story} index={i} variant="poster" matchHotChobi />
          </div>
        ))}
      </div>
    </section>
  );
}
