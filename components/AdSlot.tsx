"use client";

import { useEffect, useRef } from "react";

type Placement = "home-top" | "in-feed" | "story-bottom" | "story-mid";

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
      data-placement={placement}
      className="min-h-[90px] rounded-lg border border-white/10 bg-white/5 px-4 py-4"
      role="img"
      aria-label="Advertisement"
    >
      <span className="text-xs font-medium text-white/50">
        Ad slot: {placement}
      </span>
    </div>
  );
}
