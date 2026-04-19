"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayIcon } from "./icons";
import { briefExcerpt } from "@/lib/seo";
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
      className="relative -mb-6 w-full overflow-hidden min-h-[58.5vh] md:-mb-12 md:min-h-[55vh] lg:min-h-[60vh] xl:min-h-[65vh]"
      aria-label="Featured story"
    >
      <Link
        href={`/stories/${story.id}/`}
        className="group block h-full min-h-[58.5vh] md:min-h-[55vh] lg:min-h-[60vh] xl:min-h-[65vh]"
      >
        {story.coverImageUrl && (
          <Image
            src={story.coverImageUrl}
            alt={story.headline || story.title || "Featured story"}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            sizes="100vw"
            priority
            fetchPriority="high"
            loading="eager"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-10 md:pb-14 lg:pb-20">
            <div className="max-w-2xl">
              <p className="font-bangla text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 md:text-xs">
                শীর্ষ নির্বাচিত গল্প
              </p>
              <span className="mt-2 inline-block rounded-full border border-white/20 bg-transparent px-3 py-1 font-bangla text-[10px] font-medium text-white/95 md:mt-2.5 md:text-xs">
                ১৮+ কন্টেন্ট বিজ্ঞাপনমুক্ত
              </span>
              <h2 className="font-bangla mt-4 text-[26px] font-bold text-white drop-shadow-xl md:mt-5 md:text-4xl lg:text-5xl xl:text-6xl leading-[1.15] tracking-tight">
                {story.headline || story.title}
              </h2>
              <p className="font-bangla mt-4 max-w-xl text-sm leading-relaxed text-white/85 line-clamp-3 md:mt-5 md:text-base lg:text-lg">
                {story.summary || briefExcerpt(story.body || "", 18)}
              </p>
              <span className="mt-5 inline-flex items-center gap-2.5 rounded-md bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:mt-6 md:px-7 md:py-4 md:text-base">
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
