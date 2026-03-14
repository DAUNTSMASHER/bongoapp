"use client";

import { useEffect, useRef } from "react";
import { loadAllAdScripts } from "@/lib/ads";
import { ADS_ENABLED } from "@/lib/adPlacementConfig";

interface PopAdPlacementProps {
  placement: string;
}

/**
 * Pop ad placement — loads Cardinal Tangible pop script when in viewport.
 * Place in 8–10 high-traffic areas for maximum earning.
 */
export default function PopAdPlacement({ placement }: PopAdPlacementProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ADS_ENABLED || typeof document === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          el.setAttribute("data-pop-ad-loaded", "true");
          loadAllAdScripts();
        });
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [placement]);

  return (
    <div
      ref={ref}
      data-pop-ad-placement={placement}
      className="min-h-0 w-full"
      aria-hidden
    />
  );
}
