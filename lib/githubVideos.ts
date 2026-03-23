/**
 * Fetch crawled videos from GitHub (raw JSON file).
 * No quota limits – GitHub allows generous reads.
 * Env: GITHUB_REPO (owner/repo), GITHUB_BRANCH (default: main), GITHUB_VIDEOS_PATH (default: data/crawled-videos.json)
 */

import type { Video } from "@/types/video";

const CACHE_MS = 5 * 60 * 1000; // 5 min
let cached: { videos: Video[]; at: number } | null = null;

function getRawUrl(): string | null {
  const repo = process.env.GITHUB_REPO?.trim(); // e.g. "user/story-reading-app"
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const path = process.env.GITHUB_VIDEOS_PATH?.trim() || "data/crawled-videos.json";
  if (!repo) return null;
  return `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
}

function parseVideo(v: Record<string, unknown>): Video {
  return {
    id: String(v.id ?? ""),
    title: String(v.title ?? "Video"),
    thumbnailUrl: String(v.thumbnailUrl ?? ""),
    outboundUrl: String(v.outboundUrl ?? ""),
    embedUrl: v.embedUrl ? String(v.embedUrl) : undefined,
    embedCode: v.embedCode ? String(v.embedCode) : undefined,
    directVideoUrl: v.directVideoUrl ? String(v.directVideoUrl) : undefined,
    tags: Array.isArray(v.tags) ? v.tags.map(String) : [],
    language: String(v.language ?? "bn"),
    sourceSite: v.sourceSite ? String(v.sourceSite) : undefined,
    status: (v.status === "hidden" ? "hidden" : "active") as "active" | "hidden",
    createdAt: v.createdAt ? new Date(v.createdAt as string) : new Date(),
    resolution: v.resolution ? String(v.resolution) : undefined,
    viewCount: typeof v.viewCount === "number" ? v.viewCount : undefined,
    duration:
      v.duration != null && (typeof v.duration === "string" || typeof v.duration === "number")
        ? v.duration
        : undefined,
  };
}

export async function getVideosFromGitHub(useCache = true): Promise<Video[]> {
  const repo = process.env.GITHUB_REPO?.trim();
  const path = process.env.GITHUB_VIDEOS_PATH?.trim() || "data/crawled-videos.json";
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";

  if (useCache && cached && Date.now() - cached.at < CACHE_MS) {
    return cached.videos;
  }

  const parseAndCache = (json: unknown): Video[] => {
    const list = Array.isArray(json) ? json : (json as { videos?: unknown[] })?.videos ?? [];
    const videos = list
      .filter((v): v is Record<string, unknown> => v != null && typeof v === "object" && !!v.id)
      .map(parseVideo)
      .filter((v) => v.id && v.outboundUrl);
    cached = { videos, at: Date.now() };
    return videos;
  };

  if (!repo) {
    try {
      const fs = await import("fs/promises");
      const pathModule = await import("path");
      const localPath = pathModule.join(process.cwd(), path);
      const buf = await fs.readFile(localPath, "utf-8");
      return parseAndCache(JSON.parse(buf));
    } catch {
      return cached?.videos ?? [];
    }
  }

  const FETCH_TIMEOUT = 8000;

  try {
    const token = process.env.GITHUB_TOKEN?.trim();
    let json: unknown;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
      if (token) {
        const [owner, repoName] = repo.split("/");
        const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=${branch}`;
        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 300 },
        });
        if (!res.ok) {
          const local = await tryLocalFile(path);
          if (local) return parseAndCache(local);
          return cached?.videos ?? [];
        }
        const data = (await res.json()) as { content?: string };
        if (!data.content) return [];
        json = JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
      } else {
        const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
        const res = await fetch(rawUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "bongochoti-videos" },
          next: { revalidate: 300 },
        });
        if (!res.ok) {
          const local = await tryLocalFile(path);
          if (local) return parseAndCache(local);
          return cached?.videos ?? [];
        }
        json = (await res.json()) as unknown;
      }
      return parseAndCache(json);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    const local = await tryLocalFile(path);
    if (local) return parseAndCache(local);
    return cached?.videos ?? [];
  }
}

async function tryLocalFile(path: string): Promise<unknown | null> {
  try {
    const fs = await import("fs/promises");
    const pathModule = await import("path");
    const localPath = pathModule.join(process.cwd(), path);
    const buf = await fs.readFile(localPath, "utf-8");
    return JSON.parse(buf);
  } catch {
    return null;
  }
}

export function hasGitHubConfig(): boolean {
  return Boolean(process.env.GITHUB_REPO?.trim());
}
