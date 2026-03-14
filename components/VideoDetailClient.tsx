"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BannerAd from "@/components/BannerAd";
import SmartLinkAd from "@/components/SmartLinkAd";
import PopAdPlacement from "@/components/PopAdPlacement";
import { BackIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { addWatchedVideo } from "@/lib/library";
import type { Video } from "@/types/video";

interface VideoDetailClientProps {
  video: Video | null;
}

type PlaybackMode =
  | "direct"
  | "embedCode"
  | "embedUrl"
  | "iframeOutbound"
  | "externalLink";

/** True if URL is our Vercel Blob – use directly, no proxy needed */
function isBlobUrl(url: string): boolean {
  return /blob\.vercel-storage\.com/i.test(url);
}

/** Order: direct (Blob or proxy) first so users stay on site, then embed, then link */
function getPlaybackMode(video: Video, directFailed: boolean): PlaybackMode {
  if (video.embedCode) return "embedCode";
  if (video.embedUrl) return "embedUrl";
  if (video.outboundUrl) return "iframeOutbound";
  if (video.directVideoUrl && !directFailed) return "direct";
  return "externalLink";
}

const VIDEO_LOAD_TIMEOUT_MS = 12_000; // if no canplay/error in 12s, show fallback

export default function VideoDetailClient({ video }: VideoDetailClientProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const { user, isAnonymous } = useAuth();
  const [copied, setCopied] = useState(false);
  const [directFailed, setDirectFailed] = useState(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareUrl =
    typeof window !== "undefined" && video
      ? `${window.location.origin}/videos/?watch=${encodeURIComponent(video.id)}`
      : "";

  const handleCopyLink = () => {
    const url =
      shareUrl ||
      (typeof window !== "undefined" && video
        ? `${window.location.origin}/videos/?watch=${encodeURIComponent(video.id)}`
        : "");
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (!video) return;
    if (user && !isAnonymous && user.uid) {
      addWatchedVideo(user.uid, video).catch(() => {});
    }
  }, [video, user, isAnonymous]);

  // Timeout: if video doesn't play within N seconds, show fallback
  useEffect(() => {
    if (!video?.directVideoUrl || directFailed) return;
    loadTimeoutRef.current = setTimeout(() => {
      setDirectFailed(true);
    }, VIDEO_LOAD_TIMEOUT_MS);
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [video?.id, video?.directVideoUrl, directFailed]);

  if (!video) {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">ভিডিও পাওয়া যায়নি।</p>
        <Link
          href="/videos"
          className="mt-4 inline-block text-primary hover:underline"
        >
          ভিডিও তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  // Always show something when we have outboundUrl – never "cannot be played"
  const hasAnySource =
    video.directVideoUrl ||
    video.embedUrl ||
    video.embedCode ||
    (video.outboundUrl && video.outboundUrl.startsWith("http"));

  const mode = getPlaybackMode(video, directFailed);
  const showExternalLink =
    mode === "externalLink" || !hasAnySource;

  if (!hasAnySource && !video.outboundUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="font-bangla text-white/80">এই ভিডিওটির লিংক পাওয়া যায়নি।</p>
        <Link href="/videos" className="font-bangla text-[var(--primary)] underline">
          ভিডিও তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-20 md:pb-8 md:pt-24">
      <header className="fixed left-4 right-4 top-16 z-20 mx-auto max-w-4xl">
        <Link
          href="/videos"
          className="flex items-center gap-2 text-white/80 hover:text-white"
          aria-label="Back"
        >
          <BackIcon size={22} strokeWidth={2} />
          <span className="font-bangla text-sm">বাংলা ভিডিও</span>
        </Link>
      </header>

      <article className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-4">
        </div>

        <h1 className="font-bangla mb-4 text-xl font-bold text-white md:text-2xl">
          {video.title}
        </h1>

        {(mode === "embedCode" || mode === "embedUrl" || mode === "iframeOutbound") && (
          <p className="font-bangla mb-4 text-xs text-white/60">
            সোর্স সাইট থেকে ভিডিও আপনার ফ্রেমে প্রদর্শিত হচ্ছে।
          </p>
        )}

        {mode === "embedUrl" && video.embedUrl && (
          <p className="mb-3 text-xs text-white/50">
            <span className="text-white/60">Source (embedUrl):</span>{" "}
            <a
              href={video.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-[var(--primary)] hover:underline"
            >
              {video.embedUrl}
            </a>
          </p>
        )}

        <div
          ref={embedRef}
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-black"
        >
          {mode === "direct" && (
            <video
              src={
                video.directVideoUrl && (isBlobUrl(video.directVideoUrl) || video.directVideoUrl.startsWith("/"))
                  ? video.directVideoUrl
                  : `/api/video-proxy?id=${encodeURIComponent(video.id)}`
              }
              controls
              playsInline
              className="h-full w-full"
              onError={() => {
                if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
                setDirectFailed(true);
              }}
              onCanPlay={() => {
                if (loadTimeoutRef.current) {
                  clearTimeout(loadTimeoutRef.current);
                  loadTimeoutRef.current = null;
                }
              }}
              onStalled={() => {
                if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
                setDirectFailed(true);
              }}
            >
              আপনার ব্রাউজার ভিডিও সমর্থন করে না।
            </video>
          )}
          {mode === "embedCode" && (
            <div
              className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
              dangerouslySetInnerHTML={{ __html: video.embedCode! }}
            />
          )}
          {mode === "embedUrl" && (
            <iframe
              src={video.embedUrl!}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          {/* Source page in frame – video plays from original site, displayed in our app */}
          {mode === "iframeOutbound" && video.outboundUrl && (
            <iframe
              src={video.outboundUrl}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          {/* When only outboundUrl – show big CTA in player area (backup). Click = ad then open. */}
          {mode === "externalLink" && video.outboundUrl && (
            <button
              type="button"
              onClick={() => window.open(video.outboundUrl!, "_blank", "noopener,noreferrer")}
              className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[var(--primary)]/30 to-black p-6 text-center transition-colors hover:from-[var(--primary)]/40 hover:to-black"
            >
              <span className="flex size-20 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                <svg className="size-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="font-bangla text-lg font-semibold text-white">
                ভিডিও দেখতে ক্লিক করুন
              </span>
              <span className="font-bangla text-sm text-white/70">সোর্স সাইটে খুলবে</span>
            </button>
          )}
        </div>

        {/* Fallback link – show for embed/iframe/direct so user can open source if player fails. Click = ad then open. */}
        {video.outboundUrl &&
          (mode === "embedCode" ||
            mode === "embedUrl" ||
            mode === "iframeOutbound" ||
            directFailed ||
            mode === "direct") && (
            <button
              type="button"
              onClick={() => window.open(video.outboundUrl!, "_blank", "noopener,noreferrer")}
              className="font-bangla mt-4 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-[var(--primary)] bg-[var(--primary)]/20 px-6 py-4 text-lg font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/30"
            >
              <span>ভিডিও দেখতে এখানে ক্লিক করুন</span>
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          )}

        <PopAdPlacement placement="video-detail" />
        {/* CTA: matches "ভিডিও দেখতে" button style — natural next action */}
        <div className="mt-6">
          <SmartLinkAd
            placement="video-cta"
            variant="cta-large"
            label="আরও ভিডিও দেখুন"
          />
        </div>

        {/* Phase 1: 1 banner at bottom only */}
        <div className="mt-6">
          <BannerAd placement="story-bottom" variant="rectangle" />
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <SmartLinkAd placement="video-footer" variant="primary" label="আরও কন্টেন্ট এক্সপ্লোর করুন" />
        </div>

        {video.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="font-bangla rounded-full border border-white/10 bg-transparent px-3 py-1 text-xs text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="font-bangla mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-transparent px-4 py-3">
          <span className="text-xs text-white/60">শেয়ার লিংক:</span>
          <code className="min-w-0 flex-1 truncate text-sm text-white/90">
            {typeof window !== "undefined" ? shareUrl : `/videos/?watch=${video.id}`}
          </code>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            {copied ? "কপি হয়েছে ✓" : "লিংক কপি করুন"}
          </button>
        </div>
      </article>
    </div>
  );
}
