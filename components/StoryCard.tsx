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
          className="block overflow-hidden rounded-md bg-[var(--card-bg)] transition-transform duration-300 ease-out hover:z-10 hover:scale-110 hover:shadow-2xl"
        >
          <div className="aspect-[2/3] w-full bg-gradient-to-b from-[var(--primary)]/30 to-[var(--card-bg)] flex flex-col justify-end p-3">
            <h3 className="line-clamp-2 text-sm font-bold text-white drop-shadow-lg">
              {story.title}
            </h3>
            <p className="mt-1 text-xs text-white/80">{formatReadingTime(story.lengthType)}</p>
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
        className="group flex gap-4 overflow-hidden rounded-lg bg-[var(--card-bg)] p-3 transition-all hover:bg-[var(--card-bg)]/90"
      >
        <div className="aspect-[2/3] w-20 shrink-0 rounded bg-gradient-to-b from-[var(--primary)]/40 to-[var(--card-bg)]" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-[var(--primary)]">
            {story.title}
          </h3>
          {story.summary && (
            <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
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
