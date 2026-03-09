"use client";

import { useEffect, useRef } from "react";
import { loadAcidicDealAd } from "@/lib/ads";

interface AcidicDealSlotProps {
  className?: string;
}

/** Placeholder for acidic-deal/illinformed-summer ad. Loads script when in view. */
export default function AcidicDealSlot({ className = "" }: AcidicDealSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadAcidicDealAd();
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
      data-acidic-deal
      className={`min-h-[90px] rounded-lg border border-white/10 bg-transparent ${className}`}
      role="img"
      aria-label="Advertisement"
    />
  );
}
