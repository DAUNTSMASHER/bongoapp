"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayIcon } from "./icons";
import type { Video } from "@/types/video";

interface VideoCardProps {
  video: Video;
  index?: number;
}

export default function VideoCard({ video, index = 0 }: VideoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link
        href={`/videos/?watch=${encodeURIComponent(video.id)}`}
        className="block overflow-hidden rounded-lg bg-[var(--card-bg)] transition-transform hover:scale-[1.02] hover:shadow-xl"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-b from-[var(--primary)]/40 to-[var(--card-bg)]">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={400}
            height={225}
            className="h-full w-full object-cover"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex size-14 items-center justify-center rounded-full bg-[var(--primary)] text-white">
              <PlayIcon size={28} strokeWidth={2} />
            </span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-bangla line-clamp-2 text-sm font-semibold text-white group-hover:text-primary">
            {video.title}
          </h3>
          {video.tags.length > 0 && (
            <p className="font-bangla mt-1 text-xs text-white/60">
              {video.tags.join(" • ")}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
