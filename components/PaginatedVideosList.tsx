"use client";

import { useSearchParams } from "next/navigation";
import VideoCard from "./VideoCard";
import PaginationBar from "./PaginationBar";
import SmartLinkAd from "./SmartLinkAd";
import PopAdPlacement from "./PopAdPlacement";
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
            <VideoCard video={video} index={start + i} />
          </div>
        ))}
      </div>

      <PopAdPlacement placement="videos-list" />
      <div className="my-6 flex flex-wrap justify-center gap-3">
        <SmartLinkAd placement="videos-list" variant="primary" label="আরও ভিডিও দেখুন" />
      </div>

      <PaginationBar
        total={videos.length}
        currentPage={page}
        basePath={basePath}
        itemsPerPage={itemsPerPage}
        searchParams={pageParams}
      />
    </>
  );
}
