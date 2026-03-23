/**
 * Local videos: Blob URLs (Vercel Blob) or fallback to /Videos/ (self-hosted).
 * Add .mp4 filenames to LOCAL_VIDEO_FILES. Run `npm run upload-local-videos-to-blob`
 * to upload public/Videos to Blob and populate localVideoBlobUrls.ts.
 */

import { generateEroticTitle } from "./banglaEroticTitles";
import { LOCAL_VIDEO_BLOB_URLS } from "./localVideoBlobUrls";
import type { Video } from "@/types/video";

const LOCAL_VIDEO_FILES = [
  "22.mp4",
  "74.mp4",
  "103.mp4",
  "195.mp4",
  "215.mp4",
  "232.mp4",
  "635.mp4",
  "1043.mp4",
  "1559.mp4",
  "1579.mp4",
  "221616939_240p_h264_1046_cpspoTaKuCLnnIqh_1773519504.mp4",
  "54.mp4",
];

export function getLocalVideoFiles(): string[] {
  return [...LOCAL_VIDEO_FILES];
}

export function getLocalVideos(): Video[] {
  const files = LOCAL_VIDEO_FILES;
  if (files.length === 0) return [];
  const now = new Date();
  return files.map((filename, idx) => {
    const baseId = filename.replace(/\.mp4$/i, "");
    const id = `local-${baseId}`;
    const directVideoUrl = LOCAL_VIDEO_BLOB_URLS[baseId] ?? `/Videos/${filename}`;
    const title = generateEroticTitle(filename);
    return {
      id,
      title,
      thumbnailUrl: "",
      outboundUrl: directVideoUrl,
      directVideoUrl,
      tags: ["বাংলা", "Viral"],
      language: "bn",
      sourceSite: "local",
      status: "active" as const,
      createdAt: new Date(now.getTime() - (files.length - idx) * 3600000),
    };
  });
}

export function getLocalVideoById(id: string): Video | null {
  if (!id.startsWith("local-")) return null;
  const baseId = id.replace(/^local-/, "");
  const filename = LOCAL_VIDEO_FILES.find((f) => f.replace(/\.mp4$/i, "") === baseId);
  if (!filename) return null;
  const videos = getLocalVideos();
  return videos.find((v) => v.id === id) ?? null;
}

export function isLocalVideoId(id: string): boolean {
  return id.startsWith("local-");
}
