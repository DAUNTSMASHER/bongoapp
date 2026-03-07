"use client";

import { useEffect, useRef } from "react";
import { loadAllAdScripts } from "@/lib/ads";

type Placement = "home-top" | "in-feed" | "story-bottom" | "story-mid" | "story-part-break" | "videos-top" | "videos-in-feed" | "videos-detail";

interface AdSlotProps {
  placement: Placement;
}

export default function AdSlot({ placement }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          el.setAttribute("data-loaded", "true");
          loadAllAdScripts();
        });
      },
      { rootMargin: "300px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={`ad-${placement}`}
      data-placement={placement}
      data-effectivegatecpm
      className="min-h-[90px] rounded-lg border border-white/10 bg-white/5 px-4 py-4"
      role="img"
      aria-label="Advertisement"
    />
  );
}
