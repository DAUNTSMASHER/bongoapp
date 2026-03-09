"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HOT_CHOBI_ITEMS } from "@/lib/hotChobiData";
import { loadAllAdScripts, loadInvokeAd, INVOKE_AD } from "@/lib/ads";
import { canShowAd, recordAdShown } from "@/lib/adRateLimit";

type HotChobiItem = { src: string; headline: string };

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const SAVE_PROMPT_DELAY_MS = 5000;
const AD_VIEW_SECONDS = 6;

export default function HotChobiRail() {
  const [items, setItems] = useState<HotChobiItem[]>(HOT_CHOBI_ITEMS);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showSaveAd, setShowSaveAd] = useState(false);
  const [saveAdCountdown, setSaveAdCountdown] = useState(AD_VIEW_SECONDS);
  const [saveAdCanContinue, setSaveAdCanContinue] = useState(false);
  const savePromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/hot-chobi")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= items.length - 1 ? 0 : i + 1));
  }, [items.length]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setShowSavePrompt(false);
    if (savePromptTimerRef.current) clearTimeout(savePromptTimerRef.current);
    savePromptTimerRef.current = setTimeout(() => setShowSavePrompt(true), SAVE_PROMPT_DELAY_MS);
  };

  const closeLightbox = () => {
    if (savePromptTimerRef.current) {
      clearTimeout(savePromptTimerRef.current);
      savePromptTimerRef.current = null;
    }
    setLightboxOpen(false);
    setShowSavePrompt(false);
    setShowSaveAd(false);
  };

  const handleSaveYes = () => {
    setShowSavePrompt(false);
    if (!canShowAd()) {
      triggerImageDownload();
      return;
    }
    recordAdShown();
    loadAllAdScripts();
    loadInvokeAd();
    setShowSaveAd(true);
    setSaveAdCountdown(AD_VIEW_SECONDS);
    setSaveAdCanContinue(false);
  };

  const handleSaveNo = () => setShowSavePrompt(false);

  const triggerImageDownload = () => {
    const item = items[currentIndex];
    if (!item?.src) return;
    const a = document.createElement("a");
    a.href = item.src.startsWith("http") ? item.src : `${typeof window !== "undefined" ? window.location.origin : ""}${item.src}`;
    a.download = `${item.headline || "image"}.${item.src.endsWith(".jpg") ? "jpg" : "webp"}`;
    a.target = "_blank";
    a.click();
  };

  const handleSaveAdDismiss = () => {
    if (!showSaveAd || !saveAdCanContinue) return;
    triggerImageDownload();
    setShowSaveAd(false);
    setSaveAdCanContinue(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goPrev, goNext]);

  useEffect(() => {
    if (lightboxOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!showSaveAd || saveAdCanContinue) return;
    if (saveAdCountdown <= 0) {
      setSaveAdCanContinue(true);
      return;
    }
    const t = setInterval(() => setSaveAdCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [showSaveAd, saveAdCountdown, saveAdCanContinue]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? goNext() : goPrev();
    setTouchStart(null);
  };

  const item = items[currentIndex];

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="netflix-section section-py rounded-lg px-4 py-6 md:px-5 md:py-7"
      aria-label="Hot Chobi"
    >
      <div className="mb-4 md:mb-5">
        <h2 className="font-bangla text-lg font-bold tracking-tight text-white md:text-xl lg:text-2xl">
          Hot Chobi
        </h2>
      </div>
      <div className="relative -mx-4 md:-mx-6 lg:-mx-8">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible pb-4 pt-2 scrollbar-hide scroll-smooth px-4 md:gap-4 md:px-6 lg:gap-5 lg:px-8">
          {items.map((item, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => openLightbox(i)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.03 * i }}
              whileHover={{ scale: 1.04, zIndex: 30, y: -6 }}
              className="group relative h-[220px] w-[130px] shrink-0 cursor-pointer snap-center border-0 bg-transparent p-0 text-left md:h-[240px] md:w-[145px] lg:h-[260px] lg:w-[165px]"
              aria-label={`${item.headline} — ফুল স্ক্রিনে দেখুন`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-md border border-white/10 bg-[var(--card-bg)] transition-all duration-200 ease-out group-hover:border-[var(--primary)]/50 group-hover:shadow-lg">
                <Image
                  src={item.src}
                  alt={item.headline}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 130px, (max-width: 1024px) 145px, 165px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 opacity-100 transition-all duration-300 group-hover:pb-4">
                  <span className="font-bangla text-xs font-semibold leading-tight text-white drop-shadow-lg line-clamp-2 md:text-sm">
                    {item.headline}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
            role="dialog"
            aria-modal
            aria-label="Full screen image viewer"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-transparent text-white transition-colors hover:bg-white/5"
              aria-label="বন্ধ করুন"
            >
              <CloseIcon className="size-6" />
            </button>

            <div
              className="relative flex h-full w-full max-w-5xl items-center justify-center px-4 py-16 md:px-14 md:py-20"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-transparent text-white transition-colors hover:bg-white/5 md:left-4"
                aria-label="আগের ছবি"
              >
                <ChevronLeft className="size-8" />
              </button>

              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="relative h-[78vh] min-h-[320px] w-full max-w-4xl"
              >
                <Image
                  src={item.src}
                  alt={item.headline}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
                <p className="absolute -bottom-7 left-0 right-0 text-center font-bangla text-sm font-semibold text-white/90 drop-shadow-lg">
                  {item.headline}
                </p>
              </motion.div>

              {showSavePrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-16 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 rounded-xl border border-white/10 bg-[var(--background)] px-4 py-3"
                >
                  <p className="font-bangla text-sm text-white">আপনি কি সেভ করে রাখতে চান?</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSaveYes(); }}
                      className="font-bangla rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-[var(--primary)]/90"
                    >
                      হ্যাঁ
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSaveNo(); }}
                      className="font-bangla rounded-lg border border-white/10 px-4 py-2 text-sm text-white/90 transition-colors hover:bg-transparent"
                    >
                      না
                    </button>
                  </div>
                </motion.div>
              )}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-transparent text-white transition-colors hover:bg-white/5 md:right-4"
                aria-label="পরবর্তী ছবি"
              >
                <ChevronRight className="size-8" />
              </button>
            </div>

            <p className="absolute bottom-4 left-0 right-0 text-center font-bangla text-xs text-white/60">
              {currentIndex + 1} / {items.length} — সোয়াইপ করুন বা তীর চাপুন
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save confirmation ad modal */}
      <AnimatePresence>
        {showSaveAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/95 p-4"
            role="dialog"
            aria-modal
            aria-label="Advertisement"
          >
            <p className="font-bangla mb-3 text-sm text-white/80">
              সেভ করতে বিজ্ঞাপন দেখুন
            </p>
            <div
              id={INVOKE_AD.containerId}
              className="mb-6 min-h-[200px] w-full max-w-lg rounded-lg border border-white/10 bg-transparent"
            />
            <button
              type="button"
              onClick={handleSaveAdDismiss}
              disabled={!saveAdCanContinue}
              className="font-bangla rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition-opacity hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveAdCanContinue ? "সেভ করুন" : `${saveAdCountdown} সেকেন্ড অপেক্ষা করুন`}
            </button>
            <p className="font-bangla mt-3 text-xs text-white/50">
              বিজ্ঞাপন দেখুন, তারপর ছবি সেভ হবে
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
