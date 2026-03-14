/**
 * Local videos from public/Videos folder. Shown with Bangla erotic titles.
 * Auto-discovers .mp4 files; add new videos by dropping files into public/Videos.
 */

import * as fs from "fs";
import * as path from "path";
import { generateEroticTitle } from "./banglaEroticTitles";
import type { Video } from "@/types/video";

const VIDEOS_DIR = path.join(process.cwd(), "public", "Videos");

function discoverVideoFiles(): string[] {
  try {
    if (!fs.existsSync(VIDEOS_DIR)) return [];
    return fs.readdirSync(VIDEOS_DIR).filter((f) => /\.mp4$/i.test(f));
  } catch {
    return [];
  }
}

export function getLocalVideoFiles(): string[] {
  return discoverVideoFiles();
}

export function getLocalVideos(): Video[] {
  const files = discoverVideoFiles();
  if (files.length === 0) return [];
  const now = new Date();
  return files.map((filename, idx) => {
    const baseId = filename.replace(/\.mp4$/i, "");
    const id = `local-${baseId}`;
    const directVideoUrl = `/Videos/${filename}`;
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
  const files = discoverVideoFiles();
  const filename = files.find((f) => f.replace(/\.mp4$/i, "") === baseId);
  if (!filename) return null;
  const videos = getLocalVideos();
  return videos.find((v) => v.id === id) ?? null;
}

export function isLocalVideoId(id: string): boolean {
  return id.startsWith("local-");
}
