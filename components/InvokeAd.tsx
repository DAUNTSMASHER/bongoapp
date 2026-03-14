"use client";

import { useEffect, useRef } from "react";
import { INVOKE_AD, loadInvokeAd } from "@/lib/ads";

interface InvokeAdProps {
  className?: string;
}

export default function InvokeAd({ className = "" }: InvokeAdProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadInvokeAd();
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
      id={INVOKE_AD.containerId}
      className={`min-h-[90px] rounded-lg border border-white/10 bg-transparent ${className}`}
      role="img"
      aria-label="Advertisement"
    />
  );
}
