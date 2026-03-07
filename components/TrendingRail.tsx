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
      className="py-4"
      aria-label="Trending now"
    >
      <h2 className="mb-3 px-4 text-lg font-bold text-white">
        Trending now
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className="w-[140px] shrink-0"
          >
            <StoryCard story={story} index={i} variant="poster" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
