"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayIcon } from "./icons";
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
      className="relative -mb-6 w-full overflow-hidden md:-mb-12 md:min-h-[55vh] lg:min-h-[60vh] xl:min-h-[65vh]"
      aria-label="Featured story"
    >
      <Link
        href={`/stories/${story.id}`}
        className="block h-full min-h-[45vh] md:min-h-[55vh] lg:min-h-[60vh] xl:min-h-[65vh]"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/50 via-[#1a0a0a] to-[#0d0d0d]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_30%,#0d0d0d_90%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-8 md:pb-12 lg:pb-16">
            <div className="max-w-2xl">
              <h2 className="font-bangla text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                {story.title}
              </h2>
              <p className="font-bangla mt-3 max-w-xl text-sm text-white/90 md:mt-4 md:text-base lg:text-lg">
                {story.summary}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/30 md:mt-5 md:px-6 md:py-3.5 md:text-base">
                <PlayIcon size={20} strokeWidth={2} className="shrink-0" />
                Read now
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.section>
  );
}
