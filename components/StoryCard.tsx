"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Story } from "@/types/story";

interface StoryCardProps {
  story: Story;
  index?: number;
  variant?: "poster" | "list";
}

function formatReadingTime(lengthType: string): string {
  const map: Record<string, string> = {
    short: "~5 min",
    medium: "~15 min",
    long: "~30+ min",
  };
  return map[lengthType] ?? lengthType;
}

export default function StoryCard({ story, index = 0, variant = "poster" }: StoryCardProps) {
  if (variant === "poster") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group"
      >
        <Link
          href={`/stories/${story.id}`}
          className="block overflow-hidden rounded-lg bg-[var(--card-bg)] transition-all duration-300 ease-out hover:z-10 hover:scale-[1.03] hover:shadow-2xl md:hover:scale-[1.05] lg:rounded-xl lg:border lg:border-white/5"
        >
          <div className="aspect-[2/3] w-full bg-gradient-to-b from-[var(--primary)]/30 to-[var(--card-bg)] flex flex-col justify-end p-3 md:p-4">
            <h3 className="font-bangla line-clamp-2 text-sm font-bold text-white drop-shadow-lg md:text-base">
              {story.title}
            </h3>
            <p className="mt-1 text-xs text-white/80 md:text-sm">{formatReadingTime(story.lengthType)}</p>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/stories/${story.id}`}
        className="group flex gap-4 overflow-hidden rounded-xl bg-[var(--card-bg)] p-3 transition-all hover:bg-white/5 md:p-4 lg:hover:scale-[1.02] lg:border lg:border-white/5"
      >
        <div className="aspect-[2/3] w-20 shrink-0 rounded-lg bg-gradient-to-b from-[var(--primary)]/40 to-[var(--card-bg)] md:w-24 lg:w-28" />
        <div className="min-w-0 flex-1">
          <h3 className="font-bangla line-clamp-2 font-semibold text-white group-hover:text-primary">
            {story.title}
          </h3>
          {story.summary && (
            <p className="font-bangla mt-1 line-clamp-1 text-sm text-white/70">
              {story.summary}
            </p>
          )}
          <span className="mt-2 inline-block text-xs text-[var(--primary)]">
            {formatReadingTime(story.lengthType)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
