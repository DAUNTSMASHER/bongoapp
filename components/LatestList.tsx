"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StoryCard from "./StoryCard";
import AdSlot from "./AdSlot";
import type { Story } from "@/types/story";

const AD_INTERVAL = 5;

interface LatestListProps {
  initialStories: Story[];
}

export default function LatestList({ initialStories }: LatestListProps) {
  const [stories] = useState(initialStories);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="px-4 pb-8"
      aria-label="Latest stories"
    >
      <h2 className="mb-4 text-lg font-bold text-white">
        Latest stories
      </h2>
      <div className="flex flex-col gap-2">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 + index * 0.05 }}
          >
            {index === 1 && (
              <div className="my-3">
                <AdSlot placement="home-top" />
              </div>
            )}
            {index > 1 && (index - 1) % AD_INTERVAL === 0 && (
              <div className="my-3">
                <AdSlot placement="in-feed" />
              </div>
            )}
            <StoryCard story={story} index={index} variant="list" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
