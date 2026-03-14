"use client";

import { ADS_ENABLED } from "@/lib/adPlacementConfig";
import { getSmartLinkUrl } from "@/lib/ads";

type Variant = "inline" | "button" | "card" | "primary" | "cta-large";

interface SmartLinkAdProps {
  placement: string;
  label?: string;
  variant?: Variant;
  className?: string;
}

/** Bengali labels that feel native — blend with app CTAs */
const LABELS: Record<Variant, string> = {
  inline: "আরও দেখুন",
  button: "আরও কন্টেন্ট এক্সপ্লোর করুন",
  card: "বেশি দেখুন",
  primary: "আরও এক্সপ্লোর করুন",
  "cta-large": "পরবর্তী গল্প পড়ুন",
};

export default function SmartLinkAd({
  placement,
  label,
  variant = "inline",
  className = "",
}: SmartLinkAdProps) {
  if (!ADS_ENABLED) return null;

  const href = getSmartLinkUrl(placement);
  const displayLabel = label ?? LABELS[variant];

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className={`text-[var(--primary)] hover:underline ${className}`}
      >
        {displayLabel}
      </a>
    );
  }

  if (variant === "button") {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className={`font-bangla inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-white ${className}`}
      >
        {displayLabel}
      </a>
    );
  }

  if (variant === "card") {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className={`font-bangla flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-white ${className}`}
      >
        {displayLabel}
      </a>
    );
  }

  /** Primary CTA — matches "সব bangla choti গল্প" style */
  if (variant === "primary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className={`font-bangla inline-block rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)] ${className}`}
      >
        {displayLabel}
      </a>
    );
  }

  /** Large CTA — prominent "next/continue" style button */
  if (variant === "cta-large") {
    return (
      <a
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className={`font-bangla flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--primary)] bg-[var(--primary)]/20 px-6 py-4 text-lg font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/30 ${className}`}
      >
        <span>{displayLabel}</span>
        <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer sponsored"
      className={className}
    >
      {displayLabel}
    </a>
  );
}
