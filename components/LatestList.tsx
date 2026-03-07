"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StoryCard from "./StoryCard";
import AdSlot from "./AdSlot";
import { ITEMS_PER_PAGE } from "./PaginationBar";
import type { Story } from "@/types/story";

const AD_INTERVAL = 5;

interface LatestListProps {
  initialStories: Story[];
}

export default function LatestList({ initialStories }: LatestListProps) {
  const [stories] = useState(initialStories);
  const displayStories = stories.slice(0, ITEMS_PER_PAGE);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="pb-8 md:pb-12"
      aria-label="Latest stories"
    >
      <h2 className="mb-4 text-lg font-bold text-white md:mb-6 md:text-xl lg:text-2xl">
        Latest stories
      </h2>
      {/* Responsive grid: 1 col mobile, 2 md, 3 lg, 4 xl */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6">
        {displayStories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 + index * 0.05 }}
          >
            {index === 1 && (
              <div className="col-span-full my-3 md:my-4">
                <AdSlot placement="home-top" />
              </div>
            )}
            {index > 1 && (index - 1) % AD_INTERVAL === 0 && (
              <div className="col-span-full my-3 md:my-4">
                <AdSlot placement="in-feed" />
              </div>
            )}
            <StoryCard story={story} index={index} variant="list" />
          </motion.div>
        ))}
      </div>
      {stories.length > ITEMS_PER_PAGE && (
        <div className="mt-6 text-center">
          <Link
            href="/categories/sera/"
            className="inline-block rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            আরও গল্প দেখুন
          </Link>
        </div>
      )}
    </motion.section>
  );
}
