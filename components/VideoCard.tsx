"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayIcon } from "./icons";
import type { Video } from "@/types/video";

interface VideoCardProps {
  video: Video;
  index?: number;
  onBeforeNavigate?: (url: string, openInNewTab: boolean) => void;
}

const PLACEHOLDER_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%231a1a2e' width='400' height='225'/%3E%3Ccircle cx='200' cy='112' r='28' fill='%23ffffff' fill-opacity='0.9'/%3E%3Cpath d='M188 98v28l24-14-24-14z' fill='%231a1a2e'/%3E%3C/svg%3E";

export default function VideoCard({ video, index = 0, onBeforeNavigate }: VideoCardProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const thumb = video.thumbnailUrl?.trim();
  const hasDirectVideo = !!video.directVideoUrl;

  const playUrl = video.embedUrl || video.outboundUrl;
  const href = playUrl || `/videos/?watch=${encodeURIComponent(video.id)}`;
  const openInNewTab = !!playUrl;

  const handleClick = (e: React.MouseEvent) => {
    if (onBeforeNavigate) {
      e.preventDefault();
      onBeforeNavigate(href, openInNewTab);
    }
  };

  return (
    <motion.a
      href={href}
      {...(!onBeforeNavigate && openInNewTab && { target: "_blank", rel: "noopener noreferrer" })}
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group block overflow-hidden rounded-md bg-[var(--card-bg)] transition-transform hover:scale-[1.03] hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-b from-[var(--primary)]/40 to-[var(--card-bg)]">
        {thumb && !previewFailed ? (
          <Image
            src={thumb}
            alt={video.title}
            width={240}
            height={135}
            className="h-full w-full object-cover"
            unoptimized
            onError={() => setPreviewFailed(true)}
          />
        ) : hasDirectVideo ? (
          <video
            src={`/api/video-proxy?id=${encodeURIComponent(video.id)}`}
            preload="metadata"
            muted
            playsInline
            className="h-full w-full object-cover"
            aria-hidden
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <Image
            src={PLACEHOLDER_THUMB}
            alt={video.title}
            width={240}
            height={135}
            className="h-full w-full object-cover"
            unoptimized
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/25">
          <span className="flex size-10 items-center justify-center rounded-full bg-[var(--primary)]/95 text-white shadow-md transition-transform group-hover:scale-110 sm:size-12">
            <PlayIcon size={24} strokeWidth={2} />
          </span>
        </div>
      </div>
      <div className="p-1.5 sm:p-2">
        <h3 className="font-bangla line-clamp-2 text-xs font-semibold text-white group-hover:text-primary sm:text-sm">
          {video.title}
        </h3>
        {video.tags.length > 0 && (
          <p className="font-bangla mt-0.5 line-clamp-1 text-[10px] text-white/50 sm:text-xs">
            {video.tags.join(" • ")}
          </p>
        )}
      </div>
    </motion.a>
  );
}
