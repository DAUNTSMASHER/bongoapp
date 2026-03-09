"use client";

import { useState } from "react";
import Link from "next/link";
import StoryCard from "./StoryCard";
import { useAdPopup } from "./AdPopupProvider";
import { ITEMS_PER_PAGE } from "./PaginationBar";
import type { Story } from "@/types/story";

interface LatestListProps {
  initialStories: Story[];
}

export default function LatestList({ initialStories }: LatestListProps) {
  const [stories] = useState(initialStories);
  const adPopup = useAdPopup();
  const displayStories = stories.slice(0, ITEMS_PER_PAGE);

  return (
    <section
      className="netflix-section section-py rounded-lg px-4 py-6 md:px-5 md:py-7"
      aria-label="Latest stories"
    >
      <div className="mb-4 md:mb-6">
        <h2 className="font-bangla text-lg font-bold tracking-tight text-white md:text-xl lg:text-2xl">
          Latest stories
        </h2>
      </div>
      {/* Responsive grid: 1 col mobile, 2 md, 3 lg, 4 xl. Ads are full-width rows. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6">
        {displayStories.map((story, index) => (
          <div key={story.id} className="min-h-0">
            <StoryCard story={story} index={index} variant="list" onBeforeNavigate={adPopup?.showAdThenNavigate} />
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/stories/"
          className="font-bangla inline-block rounded-md border border-white/10 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]"
        >
          আরও গল্প দেখুন
        </Link>
      </div>
    </section>
  );
}
