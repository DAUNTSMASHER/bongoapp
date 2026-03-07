"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import BannerAd from "@/components/BannerAd";
import { BackIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { addWatchedVideo } from "@/lib/library";
import type { Video } from "@/types/video";

interface VideoDetailClientProps {
  video: Video | null;
}

export default function VideoDetailClient({ video }: VideoDetailClientProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const { user, isAnonymous } = useAuth();

  useEffect(() => {
    if (!video) return;
    if (user && !isAnonymous && user.uid) {
      addWatchedVideo(user.uid, video).catch(() => {});
    }
  }, [video, user, isAnonymous]);

  const canPlayInApp = !!(video?.directVideoUrl || video?.embedUrl || video?.embedCode);

  if (!video) {
    return (
      <div className="min-h-screen px-4 py-20 text-center">
        <p className="font-bangla text-white/70">ভিডিও পাওয়া যায়নি।</p>
        <Link
          href="/videos"
          className="mt-4 inline-block text-[var(--primary)] hover:underline"
        >
          ভিডিও তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  const hasEmbed = !!video.embedUrl || !!video.embedCode;
  const hasDirect = !!video.directVideoUrl;

  if (!hasEmbed && !hasDirect) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="font-bangla text-white/80">এই ভিডিওটি অ্যাপে চালানো যায় না।</p>
        <a
          href={video.outboundUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bangla text-[var(--primary)] underline"
        >
          মূল সাইটে দেখতে ক্লিক করুন
        </a>
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
          <BannerAd placement="story-top" variant="leaderboard" />
        </div>

        <h1 className="font-bangla mb-4 text-xl font-bold text-white md:text-2xl">
          {video.title}
        </h1>

        <p className="font-bangla mb-4 text-xs text-white/60">
          ভিডিও বাহ্যিক হোস্ট দ্বারা সরবরাহ করা হয়।
        </p>

        <div
          ref={embedRef}
          className="relative aspect-video w-full overflow-hidden rounded-lg bg-black"
        >
          {video.directVideoUrl ? (
            <video
              src={video.directVideoUrl}
              controls
              playsInline
              className="h-full w-full"
            >
              আপনার ব্রাউজার ভিডিও সমর্থন করে না।
            </video>
          ) : video.embedCode ? (
            <div
              className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
              dangerouslySetInnerHTML={{ __html: video.embedCode }}
            />
          ) : video.embedUrl ? (
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>

        <div className="mt-6">
          <BannerAd placement="story-bottom" variant="rectangle" />
        </div>

        {video.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="font-bangla rounded-full bg-white/10 px-3 py-1 text-xs text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={video.outboundUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bangla mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
        >
          মূল সাইটে দেখা
        </Link>
      </article>
    </div>
  );
}
