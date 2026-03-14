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

function formatViews(n?: number): string {
  if (n == null || n < 1000) return n ? `${n}` : "";
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function formatDuration(d?: string | number): string {
  if (d == null) return "";
  if (typeof d === "string") return d;
  const m = Math.floor(d / 60);
  const s = Math.floor(d % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `${h}h ${rm} min` : `${h} hr`;
  }
  return s > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${m} min`;
}

export default function VideoCard({ video, index = 0, onBeforeNavigate }: VideoCardProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const thumb = video.thumbnailUrl?.trim();
  const hasDirectVideo = !!video.directVideoUrl;
  const resolution = video.resolution || (video.tags.some((t) => /720|1080|1440|4k/i.test(t)) ? video.tags.find((t) => /720|1080|1440|4k/i.test(t)) : undefined);

  const href = `/videos/?watch=${encodeURIComponent(video.id)}`;

  const handleClick = (e: React.MouseEvent) => {
    if (onBeforeNavigate) {
      e.preventDefault();
      onBeforeNavigate(href, false);
    }
  };

  const metaParts: string[] = [];
  if (video.sourceSite) metaParts.push(video.sourceSite);
  if (video.viewCount != null) metaParts.push(`${formatViews(video.viewCount)} Views`);
  if (video.duration != null) metaParts.push(formatDuration(video.duration));
  if (metaParts.length === 0 && video.tags.length > 0) metaParts.push(video.tags.slice(0, 2).join(" • "));

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group block overflow-hidden rounded-lg bg-[var(--card-bg)] transition-all hover:scale-[1.02] hover:shadow-xl"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-b from-[var(--primary)]/30 to-[var(--card-bg)]">
        {thumb && !previewFailed ? (
          <Image
            src={thumb}
            alt={video.title}
            width={400}
            height={225}
            className="h-full w-full object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
            onError={() => setPreviewFailed(true)}
          />
        ) : hasDirectVideo ? (
          <video
            src={
              video.directVideoUrl?.startsWith("/")
                ? video.directVideoUrl
                : `/api/video-proxy?id=${encodeURIComponent(video.id)}`
            }
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
            width={400}
            height={225}
            className="h-full w-full object-cover"
            unoptimized
          />
        )}
        {resolution && (
          <span className="absolute right-1.5 top-1.5 rounded bg-red-600/95 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {resolution}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-[var(--card-bg)] shadow-lg">
            <PlayIcon size={28} strokeWidth={2} />
          </span>
        </div>
      </div>
      <div className="p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-[var(--primary)] sm:text-base">
          {video.title}
        </h3>
        {metaParts.length > 0 && (
          <p className="mt-1 text-xs text-white/60 sm:text-sm">
            {metaParts.join(" • ")}
          </p>
        )}
      </div>
    </motion.a>
  );
}
