"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VideoCard from "./VideoCard";
import PaginationBar from "./PaginationBar";
import { loadAllAdScripts, loadInvokeAd, INVOKE_AD } from "@/lib/ads";
import { canShowAd, recordAdShown } from "@/lib/adRateLimit";
import { useItemsPerPage } from "@/hooks/useItemsPerPage";
import type { Video } from "@/types/video";

/** Seconds user must view ad before continuing to video */
const AD_VIEW_SECONDS = 6;

interface PaginatedVideosListProps {
  videos: Video[];
  basePath: string;
  emptyMessage?: string;
}

export default function PaginatedVideosList({
  videos,
  basePath,
  emptyMessage = "কোনো ভিডিও নেই।",
}: PaginatedVideosListProps) {
  const searchParams = useSearchParams();
  const itemsPerPage = useItemsPerPage();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const start = (page - 1) * itemsPerPage;
  const paginated = videos.slice(start, start + itemsPerPage);

  const [adTarget, setAdTarget] = useState<{ url: string; openInNewTab: boolean } | null>(null);
  const [countdown, setCountdown] = useState(AD_VIEW_SECONDS);
  const [canContinue, setCanContinue] = useState(false);

  // Inject all ad scripts when interstitial opens
  useEffect(() => {
    if (!adTarget) return;
    loadAllAdScripts();
    loadInvokeAd();
    setCountdown(AD_VIEW_SECONDS);
    setCanContinue(false);
  }, [adTarget]);

  // Countdown: user must view ad before continuing
  useEffect(() => {
    if (!adTarget || canContinue) return;
    if (countdown <= 0) {
      setCanContinue(true);
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [adTarget, countdown, canContinue]);

  const handleVideoClick = (url: string, _openInNewTab: boolean) => {
    if (!canShowAd()) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    recordAdShown();
    setAdTarget({ url, openInNewTab: true });
  };

  const handleAdDismiss = () => {
    if (!adTarget || !canContinue) return;
    window.open(adTarget.url, "_blank", "noopener,noreferrer");
    setAdTarget(null);
    setCanContinue(false);
  };

  if (videos.length === 0) {
    return <p className="font-bangla text-white/70">{emptyMessage}</p>;
  }

  const pageParams: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    if (k !== "page") pageParams[k] = v;
  });

  return (
    <>
      {/* Compact grid: 2–6 cols, 30 desktop / 16 mobile per page */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {paginated.map((video, i) => (
          <div key={video.id}>
            <VideoCard
              video={video}
              index={start + i}
              onBeforeNavigate={handleVideoClick}
            />
          </div>
        ))}
      </div>


      <PaginationBar
        total={videos.length}
        currentPage={page}
        basePath={basePath}
        itemsPerPage={itemsPerPage}
        searchParams={pageParams}
      />

      {/* Ad interstitial – must view ad, no embedded video. Opens external link after. */}
      {adTarget && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal
          aria-label="Advertisement"
        >
          <p className="font-bangla mb-3 text-sm text-white/80">
            ভিডিও দেখতে ক্লিক করেছেন — বিজ্ঞাপন দেখুন
          </p>
          <div
            id={INVOKE_AD.containerId}
            className="mb-6 min-h-[200px] w-full max-w-lg rounded-lg border border-white/10 bg-transparent"
          />
          <button
            type="button"
            onClick={handleAdDismiss}
            disabled={!canContinue}
            className="font-bangla rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition-opacity hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canContinue ? "ভিডিও দেখুন" : `${countdown} সেকেন্ড অপেক্ষা করুন`}
          </button>
          <p className="font-bangla mt-3 text-xs text-white/50">
            বিজ্ঞাপন দেখুন, তারপর ভিডিওতে যাবেন
          </p>
        </div>
      )}
    </>
  );
}
