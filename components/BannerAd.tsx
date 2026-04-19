import { useEffect, useRef } from "react";
import { loadAllAdScripts, loadInvokeAd, BANNER_KEYS } from "@/lib/ads";

/**
 * Banner ad for reading view. Uses Adsterra scripts.
 */
interface BannerAdProps {
  placement: string;
  variant?: "leaderboard" | "rectangle" | "large" | "native" | "mobile" | "sidebar";
}

const HEIGHTS: Record<string, string> = {
  leaderboard: "h-[90px]", // 728x90
  rectangle: "h-[250px]",   // 300x250
  large: "h-[60px]",       // 468x60
  native: "min-h-[200px]",
  mobile: "h-[50px]",      // 320x50
  sidebar: "h-[600px]",    // 160x600
};

const VARIANT_TO_KEY: Record<string, string> = {
  leaderboard: "728x90",
  rectangle: "300x250",
  large: "468x60",
  mobile: "320x50",
  sidebar: "160x600",
  native: "native",
};

export default function BannerAd({ placement, variant = "rectangle" }: BannerAdProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.setAttribute("data-loaded", "true");
            loadAllAdScripts();
            const keyType = VARIANT_TO_KEY[variant] || "300x250";
            const adKey = BANNER_KEYS[keyType];
            if (adKey) {
              loadInvokeAd(adKey);
            }
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  const keyType = VARIANT_TO_KEY[variant] || "300x250";
  const adKey = BANNER_KEYS[keyType];
  const containerId = `container-${adKey}`;

  return (
    <div
      ref={ref}
      id={containerId}
      data-placement={placement}
      data-type={variant}
      className={`w-full ${HEIGHTS[variant] || "min-h-[100px]"} flex items-center justify-center rounded-lg bg-black/5 mx-auto`}
      role="img"
      aria-label="Advertisement"
    />
  );
}
