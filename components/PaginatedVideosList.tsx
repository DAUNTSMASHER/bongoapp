"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import VideoCard from "./VideoCard";
import AdSlot from "./AdSlot";
import PaginationBar from "./PaginationBar";
import { loadAllAdScripts } from "@/lib/ads";
import { useItemsPerPage } from "@/hooks/useItemsPerPage";
import type { Video } from "@/types/video";

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

  // Inject effectivegatecpm ad scripts when interstitial opens
  useEffect(() => {
    if (!adTarget) return;
    loadAllAdScripts();
  }, [adTarget]);

  const handleVideoClick = (url: string, openInNewTab: boolean) => {
    setAdTarget({ url, openInNewTab });
  };

  const handleAdDismiss = () => {
    if (adTarget) {
      if (adTarget.openInNewTab) {
        window.open(adTarget.url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = adTarget.url;
      }
      setAdTarget(null);
    }
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
          <div key={video.id} className="contents">
            {/* Ad + space every 5 videos */}
            {i > 0 && i % 5 === 0 && (
              <div className="col-span-2 my-3 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6">
                <AdSlot placement="videos-in-feed" />
              </div>
            )}
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

      {/* Ad interstitial – effectivegatecpm ad loads, then redirect on button click */}
      {adTarget && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal
          aria-label="Advertisement"
        >
          <div id="effectivegatecpm-container" className="mb-4 min-h-[120px] w-full max-w-md" />
          <button
            type="button"
            onClick={handleAdDismiss}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:bg-[var(--primary)]/90"
          >
            ভিডিও দেখুন
          </button>
        </div>
      )}
    </>
  );
}
