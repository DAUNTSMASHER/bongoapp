"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import VideoCard from "./VideoCard";
import AdSlot from "./AdSlot";
import PaginationBar, { ITEMS_PER_PAGE } from "./PaginationBar";
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = videos.slice(start, start + ITEMS_PER_PAGE);

  if (videos.length === 0) {
    return <p className="font-bangla text-white/70">{emptyMessage}</p>;
  }

  const pageParams: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    if (k !== "page") pageParams[k] = v;
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((video, i) => (
          <div key={video.id} className="contents">
            {(i === 2 || (i > 2 && (i - 2) % 6 === 0)) && (
              <div className="col-span-full my-4">
                <AdSlot placement="videos-in-feed" />
              </div>
            )}
            <VideoCard video={video} index={start + i} />
          </div>
        ))}
      </div>
      <PaginationBar
        total={videos.length}
        currentPage={page}
        basePath={basePath}
        searchParams={pageParams}
      />
    </>
  );
}
