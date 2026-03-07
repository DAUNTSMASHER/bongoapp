"use client";

import PaginatedVideosList from "./PaginatedVideosList";
import type { Video } from "@/types/video";

interface VideosListClientProps {
  videos: Video[];
}

export default function VideosListClient({ videos }: VideosListClientProps) {
  return (
    <PaginatedVideosList
      videos={videos}
      basePath="/videos/"
      emptyMessage="কোনো ভিডিও নেই।"
    />
  );
}
