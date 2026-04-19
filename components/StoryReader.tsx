"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import BannerAd from "./BannerAd";
import SmartLinkAd from "./SmartLinkAd";
import PopAdPlacement from "./PopAdPlacement";
import { BackIcon, FolderIcon, LibraryIcon, BookmarkIcon, SunIcon, MoonIcon } from "./icons";
import ShareButtons from "./ShareButtons";
import ShareToFacebookPageModal from "./ShareToFacebookPageModal";
import { extractCleanHeadline, extractStoryBody } from "@/lib/storyTextExtractor";
import type { Story } from "@/types/story";

const FONT_SIZES = ["base", "lg", "xl"] as const;

const TARGET_PARTS = 5;
const MIN_PART_CHARS = 150;

/** Split body into 4-5 parts at paragraph boundaries (client-side fallback) */
function splitBodyIntoParts(body: string): string[] {
  const trimmed = body?.trim() || "";
  if (!trimmed) return [];
  if (trimmed.length < MIN_PART_CHARS * 2) return [trimmed];
  const paragraphs = trimmed.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length <= TARGET_PARTS) return paragraphs;
  const totalChars = paragraphs.reduce((s, p) => s + p.length, 0);
  const idealSize = Math.max(MIN_PART_CHARS, Math.floor(totalChars / TARGET_PARTS));
  const parts: string[] = [];
  let current: string[] = [];
  let currentLen = 0;
  for (const p of paragraphs) {
    const pLen = p.length + 2;
    if (currentLen + pLen > idealSize && current.length > 0) {
      parts.push(current.join("\n\n"));
      current = [];
      currentLen = 0;
    }
    current.push(p);
    currentLen += pLen;
  }
  if (current.length > 0) parts.push(current.join("\n\n"));
  if (parts.length > TARGET_PARTS + 1) {
    const last = parts.pop()!;
    parts[parts.length - 1] = parts[parts.length - 1] + "\n\n" + last;
  }
  return parts.length >= 2 ? parts : [body];
}

/** Headline: use stored or first sentence of body, always cleaned (no by/date/stats) */
function getHeadline(story: Story): string {
  const raw = story.headline?.trim() || story.title?.trim() || "";
  if (raw) {
    const cleaned = extractCleanHeadline(raw);
    if (cleaned) return cleaned;
  }
  const firstPara = story.body?.split(/\n\n+/)[0]?.trim() || "";
  const firstSentence = firstPara.match(/^[^।.!?]+[।.!?]?/)?.[0]?.trim() || firstPara.slice(0, 70);
  const phrase = firstSentence.replace(/\s+/g, " ").trim();
  return extractCleanHeadline(phrase) || phrase || raw || "গল্প";
}

/** Get tags: hashtags first, then regular tags, or generate #বাংলা #গল্প */
function getDisplayTags(story: Story): string[] {
  const hashtags = story.hashtags?.filter(Boolean) || [];
  if (hashtags.length > 0) return hashtags;
  if (story.tags?.length) return story.tags;
  return ["#বাংলা", "#গল্প"];
}

/** Get story as parts (from Firestore or client-side split) for ad breaks. Filters CTA. */
function getParts(story: Story): string[] {
  const body = extractStoryBody(story.body || "");
  if (story.parts?.length && story.parts.length >= 2) {
    return story.parts.map((p) => extractStoryBody(p)).filter(Boolean);
  }
  return splitBodyIntoParts(body);
}

const READING_BG_KEY = "story-reader-bg";

export default function StoryReader({ story }: StoryReaderProps) {
  const [fontStep, setFontStep] = useState(1);
  const [darkMode, setDarkMode] = useState(true); // default dark for Netflix look
  const [readingComplete, setReadingComplete] = useState(false);
  const [fbPageModalOpen, setFbPageModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(READING_BG_KEY);
    if (stored === "light") setDarkMode(false);
  }, []);

  const toggleBg = () => {
    setDarkMode((d) => {
      const next = !d;
      if (typeof window !== "undefined") localStorage.setItem(READING_BG_KEY, next ? "dark" : "light");
      return next;
    });
  };

  const headline = getHeadline(story);
  const displayTags = getDisplayTags(story);
  const parts = useMemo(() => getParts(story), [story]);

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

  const isLight = !darkMode;
  const barBg = isLight ? "bg-white/95" : "bg-[var(--background)]";
  const barBorder = isLight ? "border-gray-200" : "border-white/10";
  const barText = isLight ? "text-gray-900" : "text-white";
  const barIcon = isLight ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900" : "text-white/80 hover:bg-white/5 hover:text-white";
  const contentBg = isLight ? "bg-white" : "bg-transparent";
  const headlineCls = isLight ? "text-gray-900" : "text-white";
  const tagCls = isLight ? "border-gray-300 text-gray-700 bg-gray-50" : "border-white/10 bg-transparent text-[var(--primary)]";

  return (
    <div className={`min-h-screen pb-28 pt-20 md:pb-24 md:pt-24 ${isLight ? "bg-gray-100" : ""}`}>
      {/* Floating top bar - quick nav */}
      <header className={`fixed left-4 right-4 top-16 z-20 mx-auto max-w-3xl rounded-xl border px-4 py-3 shadow-xl md:left-1/2 md:right-auto md:-translate-x-1/2 md:top-20 ${barBg} ${barBorder}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${barIcon}`}
            aria-label="Back"
          >
            <BackIcon size={22} strokeWidth={2} />
          </Link>
          <Link
            href="/categories/"
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${barIcon}`}
            aria-label="Categories"
          >
            <FolderIcon size={22} strokeWidth={2} />
          </Link>
          <span className={`font-bangla min-w-0 flex-1 truncate text-sm font-semibold ${barText}`}>
            {headline}
          </span>
          <Link
            href="/library/"
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${barIcon}`}
            aria-label="Library"
          >
            <LibraryIcon size={22} strokeWidth={2} />
          </Link>
        </div>
      </header>

      <article className={`mx-auto max-w-3xl px-4 md:px-6 lg:px-8 ${contentBg} ${isLight ? "my-4 rounded-xl py-6 shadow-sm md:my-6 md:py-8" : ""}`}>
        {/* Cover image at top of story - full screen height, full image visible (no crop) */}
        {story.coverImageUrl && (
          <div className="relative -mx-4 mb-6 flex h-[100dvh] min-h-[400px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/20 md:mx-0 md:rounded-xl">
            <Image
              src={story.coverImageUrl}
              alt={headline}
              fill
              className="object-contain object-center"
              sizes="100vw"
              priority
            />
          </div>
        )}
        <header className="mb-6">
          <h1 className={`font-bangla text-2xl font-bold ${headlineCls}`}>{headline}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ShareButtons title={headline} path={`/stories/${story.id}/`} variant={isLight ? "light" : "dark"} />
            <button
              type="button"
              onClick={() => setFbPageModalOpen(true)}
              className={`font-bangla flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                isLight
                  ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                  : "border-white/10 text-white/90 hover:bg-white/5"
              }`}
              aria-label="Post to Facebook Page"
            >
              <span>📘</span>
              Post to Page
            </button>
          </div>
          <ShareToFacebookPageModal
            isOpen={fbPageModalOpen}
            onClose={() => setFbPageModalOpen(false)}
            body={extractStoryBody(story.body || "")}
            link={typeof window !== "undefined" ? `${window.location.origin}/stories/${story.id}/` : `/stories/${story.id}/`}
            title={headline}
            variant={isLight ? "light" : "dark"}
          />
          {displayTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className={`font-bangla rounded-full border px-3 py-1 text-xs font-medium ${tagCls}`}
                >
                  {tag.startsWith("#") ? tag : tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <PopAdPlacement placement="story-top" />

        <div
          ref={contentRef}
          className={`font-bangla prose max-w-none ${isLight ? "prose-p:text-gray-800 prose-headings:text-gray-900" : "prose-invert prose-p:text-white/90 prose-headings:text-white"}`}
          style={{
            fontSize:
              fontSize === "base" ? "1rem" : fontSize === "lg" ? "1.125rem" : "1.25rem",
            lineHeight: 1.8,
          }}
        >
          {parts.map((part, index) => (
            <div key={index}>
              <div
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br />") }}
              />
              
              {/* Intelligent Ad Insertion: Every 2 parts or specific milestones */}
              {index < parts.length - 1 && (
                <div className="my-8 flex flex-col items-center gap-4">
                  {(index + 1) % 2 === 0 ? (
                    <BannerAd placement={`story-mid-${index}`} variant="rectangle" />
                  ) : index === 0 ? (
                    <>
                      <PopAdPlacement placement="story-mid" />
                      <div className="w-full max-w-sm">
                        <SmartLinkAd
                          placement="story-mid"
                          variant="cta-large"
                          label="চালিয়ে পড়ুন (Continue)"
                        />
                      </div>
                    </>
                  ) : null}

                  {story.coverImageUrl && index === 1 && (
                    <div className={`relative flex w-full items-center justify-center overflow-hidden rounded-xl border bg-black/10 ${isLight ? "border-gray-200" : "border-white/10"}`}>
                      <div className="relative h-[60dvh] w-full min-h-[300px]">
                        <Image
                          src={story.coverImageUrl}
                          alt={headline}
                          fill
                          className="object-contain object-center"
                          sizes="100vw"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div data-read-end aria-hidden className="h-1" />
        </div>

        {/* Native Ad Section: High CTR "Recommended Content" */}
        <div className="mt-12 border-t border-dashed border-white/10 pt-8">
           <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Recommended for you</h3>
           <BannerAd placement="story-footer-native" variant="native" />
        </div>

        {/* CTA: looks like natural "next story" button */}
        <div className="mt-8 flex flex-col gap-4">
          <SmartLinkAd
            placement="story-end-cta"
            variant="cta-large"
            label="পরবর্তী গল্প পড়ুন (Next Story)"
          />
          <SmartLinkAd
            placement="story-end-secondary"
            variant="primary"
            label="আরও রোমান্টিক গল্প দেখুন"
          />
        </div>

        {/* Phase 1: 1 banner at bottom only */}
        <PopAdPlacement placement="story-bottom" />
        <div className="mt-8">
          <BannerAd placement="story-bottom" variant="rectangle" />
        </div>

        <section className={`mt-8 border-t pt-6 ${isLight ? "border-gray-200" : "border-white/10"}`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)]">
            Similar stories
          </h2>
          <p className={`mt-2 text-sm ${isLight ? "text-gray-600" : "text-white/60"}`}>(Coming soon)</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <SmartLinkAd placement="story-footer" variant="primary" label="আরও গল্প দেখুন" />
          </div>
          {readingComplete && (
            <p className="mt-4 text-sm font-medium text-[var(--primary)]">
              Thanks for reading! ✓
            </p>
          )}
        </section>
      </article>

      {/* Floating bottom bar - reading controls */}
      <nav
        className={`fixed bottom-20 left-4 right-4 z-20 mx-auto flex max-w-3xl items-center justify-center gap-2 rounded-xl border px-4 py-3 shadow-xl md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-8 ${barBg} ${barBorder}`}
        aria-label="Reading controls"
      >
        <button
          type="button"
          onClick={() => setFontStep((s) => Math.max(0, s - 1))}
          className={`flex size-11 items-center justify-center rounded-lg border bg-transparent text-lg font-medium transition-all hover:bg-primary hover:border-primary ${isLight ? "border-gray-300 text-gray-800" : "border-white/10 text-white"}`}
          aria-label="Decrease font size"
        >
          A−
        </button>
        <button
          type="button"
          onClick={() => setFontStep((s) => Math.min(2, s + 1))}
          className={`flex size-11 items-center justify-center rounded-lg border bg-transparent text-lg font-medium transition-all hover:bg-primary hover:border-primary ${isLight ? "border-gray-300 text-gray-800" : "border-white/10 text-white"}`}
          aria-label="Increase font size"
        >
          A+
        </button>
        <button
          type="button"
          onClick={toggleBg}
          className={`flex size-11 items-center justify-center rounded-lg border bg-transparent transition-all hover:bg-primary hover:border-primary [&_svg]:text-current ${isLight ? "border-gray-300 text-gray-800" : "border-white/10 text-white"}`}
          aria-label={darkMode ? "Switch to light background" : "Switch to dark background"}
        >
          {darkMode ? <SunIcon size={20} strokeWidth={2} /> : <MoonIcon size={20} strokeWidth={2} />}
        </button>
        <button
          type="button"
          className={`flex size-11 items-center justify-center rounded-lg border bg-transparent transition-all hover:bg-primary hover:border-primary ${isLight ? "border-gray-300 text-gray-800" : "border-white/10 text-white"}`}
          aria-label="Bookmark"
        >
          <BookmarkIcon size={20} strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
}

interface StoryReaderProps {
  story: Story;
}
