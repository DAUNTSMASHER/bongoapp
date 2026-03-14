"use client";

import Link from "next/link";
import Image from "next/image";
import { briefExcerpt } from "@/lib/seo";
import type { Story } from "@/types/story";

interface StoryCardProps {
  story: Story;
  index?: number;
  variant?: "poster" | "list";
  /** When set, intercepts click to show ad before navigating */
  onBeforeNavigate?: (href: string) => void;
  /** Match Hot Chobi section dimensions (220×130, 240×145, 260×165) */
  matchHotChobi?: boolean;
}

function formatReadingTime(lengthType: string): string {
  const map: Record<string, string> = {
    short: "~5 min",
    medium: "~15 min",
    long: "~30+ min",
  };
  return map[lengthType] ?? lengthType;
}

export default function StoryCard({ story, index = 0, variant = "poster", onBeforeNavigate, matchHotChobi }: StoryCardProps) {
  const href = `/stories/${story.id}`;
  const handleClick = (e: React.MouseEvent) => {
    if (onBeforeNavigate) {
      e.preventDefault();
      onBeforeNavigate(href);
    }
  };

  if (variant === "poster") {
    const posterInnerClass = matchHotChobi
      ? "h-full w-full relative overflow-hidden flex flex-col justify-end p-3 md:p-3.5"
      : "aspect-[2/3] w-full relative overflow-hidden flex flex-col justify-end p-3 md:p-4";
    return (
      <div
        className={`group ${matchHotChobi ? "h-[220px] w-[130px] shrink-0 md:h-[240px] md:w-[145px] lg:h-[260px] lg:w-[165px]" : ""}`}
      >
        <Link
          href={href}
          onClick={handleClick}
          className="block h-full w-full overflow-hidden rounded-md border border-white/10 bg-[var(--card-bg)] transition-all duration-200 ease-out hover:z-10 hover:scale-[1.02] hover:border-[var(--primary)]/50 hover:shadow-lg md:hover:scale-[1.03]"
        >
          <div className={posterInnerClass}>
            {story.coverImageUrl ? (
              <>
                <Image
                  src={story.coverImageUrl}
                  alt={story.headline || story.title || "Story cover"}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes={matchHotChobi ? "(max-width: 768px) 130px, 165px" : "(max-width: 768px) 50vw, 33vw"}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                <div className="relative">
                  <h3 className="font-bangla line-clamp-2 text-sm font-bold text-white drop-shadow-lg md:text-base">
                    {story.headline || story.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/90 md:text-sm">{formatReadingTime(story.lengthType)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/25 to-[var(--card-bg)]" />
                <div className="relative">
                  <h3 className="font-bangla line-clamp-2 text-sm font-bold text-white drop-shadow-lg md:text-base">
                    {story.headline || story.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/80 md:text-sm">{formatReadingTime(story.lengthType)}</p>
                </div>
              </>
            )}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Link
        href={href}
        onClick={handleClick}
        className="group flex h-full items-start gap-4 overflow-hidden rounded-md border border-white/10 bg-[var(--card-bg)] p-3 transition-colors hover:border-[var(--primary)]/40 hover:bg-transparent md:p-4"
      >
        <div className="aspect-[2/3] w-20 shrink-0 self-start overflow-hidden rounded-lg ring-1 ring-white/10 bg-gradient-to-b from-[var(--primary)]/40 to-[var(--card-bg)] md:w-24 lg:w-28 relative">
          {story.coverImageUrl ? (
            <Image
              src={story.coverImageUrl}
              alt={story.headline || story.title || "Story cover"}
              fill
              className="object-cover transition-opacity duration-300 group-hover:opacity-75"
              sizes="112px"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-start gap-0">
          <h3 className="font-bangla line-clamp-2 font-semibold leading-snug text-white group-hover:text-primary">
            {story.headline || story.title}
          </h3>
          {(story.summary || story.body) && (
            <p className="font-bangla mt-1.5 line-clamp-2 text-sm leading-snug text-white/70">
              {briefExcerpt(story.summary || story.body || "", 12)}
            </p>
          )}
          <span className="mt-2 inline-block text-xs font-medium text-[var(--primary)]">
            {formatReadingTime(story.lengthType)}
          </span>
        </div>
      </Link>
    </div>
  );
}
