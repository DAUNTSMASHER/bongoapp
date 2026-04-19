"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/stories";

const TOP_CATEGORIES = 6;

export default function CategoryChips() {
  const top = CATEGORIES.slice(0, TOP_CATEGORIES);

  return (
    <section
      className="netflix-section section-py rounded-lg px-4 py-5 md:px-5 md:py-6"
      aria-label="Bangla choti categories"
    >
      <h2 className="font-bangla mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
        Bangla Choti বিভাগ — চটি গল্প ক্যাটাগরি
      </h2>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {top.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/categories/${slug}/`}
            className="font-bangla block shrink-0 rounded-md border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white md:px-5 md:py-3 md:text-base"
          >
            {label}
          </Link>
        ))}
        <Link
          href="/categories/"
          className="font-bangla block shrink-0 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white md:px-6 md:py-3 md:text-base"
          title="সব bangla choti বিভাগ"
        >
          সব bangla choti বিভাগ
        </Link>
      </div>
    </section>
  );
}
