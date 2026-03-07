"use client";

import { useEffect, useRef } from "react";

/**
 * Banner ad for reading view only. No popups - banner style only.
 * Use in StoryReader. Popup/interstitial ads should only show after reading is complete.
 */
interface BannerAdProps {
  placement: "story-top" | "story-mid" | "story-bottom";
  variant?: "leaderboard" | "rectangle" | "large";
}

const HEIGHTS: Record<string, string> = {
  leaderboard: "h-[90px]",
  rectangle: "h-[250px]",
  large: "h-[100px]",
};

export default function BannerAd({ placement, variant = "rectangle" }: BannerAdProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) el.setAttribute("data-loaded", "true");
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-placement={placement}
      data-type="banner"
      className={`w-full ${HEIGHTS[variant]} flex items-center justify-center rounded-lg border border-white/10 bg-white/5`}
      role="img"
      aria-label="Advertisement"
    >
      <span className="text-xs font-medium text-white/50">
        Banner: {placement}
      </span>
    </div>
  );
}
