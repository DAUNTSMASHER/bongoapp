"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BannerAd from "./BannerAd";
import type { Story } from "@/types/story";

const FONT_SIZES = ["base", "lg", "xl"] as const;

export default function StoryReader({ story }: StoryReaderProps) {
  const [fontStep, setFontStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [readingComplete, setReadingComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fontSize = FONT_SIZES[fontStep];

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setReadingComplete(true);
        });
      },
      { threshold: 0.9 }
    );
    const endSentinel = el.querySelector("[data-read-end]");
    if (endSentinel) observer.observe(endSentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen pb-28 pt-20">
      {/* Floating top bar - quick nav */}
      <header className="fixed left-4 right-4 top-16 z-20 mx-auto max-w-2xl rounded-xl border border-white/10 bg-black/80 px-4 py-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Back"
          >
            ←
          </Link>
          <Link
            href="/categories"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Categories"
          >
            📂
          </Link>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
            {story.title}
          </span>
          <Link
            href="/library"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Library"
          >
            📚
          </Link>
        </div>
      </header>

      <article className={`mx-auto max-w-prose px-4 ${darkMode ? "dark" : ""}`}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">{story.title}</h1>
          {story.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[var(--primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Banner ad - top of story (only banner, no popup) */}
        <div className="mb-6">
          <BannerAd placement="story-top" variant="rectangle" />
        </div>

        <div
          ref={contentRef}
          className="prose prose-invert max-w-none prose-p:text-white/90"
          style={{
            fontSize:
              fontSize === "base" ? "1rem" : fontSize === "lg" ? "1.125rem" : "1.25rem",
            lineHeight: 1.8,
          }}
        >
          <div
            className="whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: story.body.replace(/\n/g, "<br />") }}
          />
          {/* Banner ad - mid story */}
          <div className="my-8">
            <BannerAd placement="story-mid" variant="rectangle" />
          </div>
          <div data-read-end aria-hidden className="h-1" />
        </div>

        {/* Banner ad - bottom */}
        <div className="mt-8">
          <BannerAd placement="story-bottom" variant="rectangle" />
        </div>

        <section className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
            Similar stories
          </h2>
          <p className="mt-2 text-sm text-white/60">(Coming soon)</p>
          {readingComplete && (
            <p className="mt-4 text-sm font-medium text-[var(--primary)]">
              Thanks for reading! ✓
            </p>
          )}
        </section>
      </article>

      {/* Floating bottom bar - reading controls (above app nav) */}
      <nav
        className="fixed bottom-20 left-4 right-4 z-20 mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/80 px-4 py-3 shadow-xl backdrop-blur-md"
        aria-label="Reading controls"
      >
        <button
          type="button"
          onClick={() => setFontStep((s) => Math.max(0, s - 1))}
          className="flex size-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg font-medium text-white transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)]"
          aria-label="Decrease font size"
        >
          A−
        </button>
        <button
          type="button"
          onClick={() => setFontStep((s) => Math.min(2, s + 1))}
          className="flex size-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg font-medium text-white transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)]"
          aria-label="Increase font size"
        >
          A+
        </button>
        <button
          type="button"
          onClick={() => setDarkMode((d) => !d)}
          className="flex size-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)]"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)]"
          aria-label="Bookmark"
        >
          🔖
        </button>
      </nav>
    </div>
  );
}

interface StoryReaderProps {
  story: Story;
}
