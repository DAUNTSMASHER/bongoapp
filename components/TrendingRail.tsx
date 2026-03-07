"use client";

import { motion } from "framer-motion";
import StoryCard from "./StoryCard";
import type { Story } from "@/types/story";

interface TrendingRailProps {
  stories: Story[];
}

export default function TrendingRail({ stories }: TrendingRailProps) {
  if (stories.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-6 md:py-8 lg:py-10"
      aria-label="Trending now"
    >
      <h2 className="mb-4 text-lg font-bold text-white md:mb-5 md:text-xl lg:text-2xl">
        Trending now
      </h2>
      {/* Mobile: horizontal scroll | Desktop: grid, no scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide md:gap-4 md:pb-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible">
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className="w-[140px] shrink-0 md:w-[160px] lg:w-full lg:shrink"
          >
            <StoryCard story={story} index={i} variant="poster" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
