"use client";

import StoryCard from "./StoryCard";
import { useAdPopup } from "./AdPopupProvider";
import type { Story } from "@/types/story";

interface TrendingRailProps {
  stories: Story[];
}

export default function TrendingRail({ stories }: TrendingRailProps) {
  const adPopup = useAdPopup();
  if (stories.length === 0) return null;

  return (
    <section
      className="netflix-section section-py rounded-lg px-4 py-6 md:px-5 md:py-7"
      aria-label="Trending now"
    >
      <div className="mb-4 flex items-center gap-3 md:mb-5">
        <h2 className="font-bangla text-lg font-bold tracking-tight text-white md:text-xl lg:text-2xl">
          Trending now
        </h2>
      </div>
      {/* Mobile: horizontal scroll | Desktop: grid, no scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide md:gap-4 md:pb-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible">
        {stories.map((story, i) => (
          <div key={story.id} className="shrink-0">
            <StoryCard story={story} index={i} variant="poster" matchHotChobi onBeforeNavigate={adPopup?.showAdThenNavigate} />
          </div>
        ))}
      </div>
    </section>
  );
}
