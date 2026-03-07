"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Story } from "@/types/story";

interface HeroBannerProps {
  story: Story;
}

export default function HeroBanner({ story }: HeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative -mb-8 h-[45vh] min-h-[220px] w-full overflow-hidden"
      aria-label="Featured story"
    >
      <Link href={`/stories/${story.id}`} className="block h-full">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/40 via-[#1a0a0a] to-[#0d0d0d]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="max-w-xl text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
            {story.title}
          </h2>
          <p className="mt-2 text-sm text-white/90">
            {story.summary}
          </p>
          <span className="mt-3 inline-block rounded bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
            Read now
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
