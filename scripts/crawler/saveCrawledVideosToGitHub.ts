/**
 * Save CrawledVideo[] to a JSON file in a GitHub repo.
 * Uses GitHub Contents API. No Firestore quota.
 * Env: GITHUB_TOKEN (PAT with repo scope), GITHUB_REPO, GITHUB_BRANCH, GITHUB_VIDEOS_PATH
 */

import type { CrawledVideo } from "./crawlBanglaChotiVideos";

const DEFAULT_PATH = "data/crawled-videos.json";

interface GitHubFile {
  sha?: string;
  content: string;
  message: string;
}

async function getFile(owner: string, repo: string, path: string, branch: string): Promise<{ sha: string; content: string } | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) throw new Error("GITHUB_TOKEN required for saving to GitHub");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { sha: string; content: string };
  return { sha: data.sha, content: data.content };
}

async function putFile(owner: string, repo: string, path: string, body: GitHubFile, branch: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) throw new Error("GITHUB_TOKEN required");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: body.message,
      content: Buffer.from(body.content, "utf-8").toString("base64"),
      sha: body.sha,
      branch,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
}

function toStored(v: CrawledVideo): Record<string, unknown> {
  return {
    id: v.id,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl || "",
    outboundUrl: v.outboundUrl,
    embedUrl: v.embedUrl || null,
    directVideoUrl: v.directVideoUrl || null,
    tags: v.tags || [],
    language: "bn",
    sourceSite: v.sourceSite || "banglachotikahinii",
    status: "active",
    duration: v.duration ?? null,
    viewCount: v.viewCount ?? null,
    resolution: v.resolution ?? null,
    createdAt: new Date().toISOString(),
  };
}

export async function saveCrawledVideosToGitHub(
  newVideos: CrawledVideo[],
  options?: { merge?: boolean }
): Promise<{ saved: number; total: number }> {
  const repo = process.env.GITHUB_REPO?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!repo || !token) {
    throw new Error("GITHUB_REPO and GITHUB_TOKEN env vars required. Add them in .env.local or Vercel.");
  }
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) throw new Error("GITHUB_REPO must be owner/repo (e.g. user/story-reading-app)");
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const path = process.env.GITHUB_VIDEOS_PATH?.trim() || DEFAULT_PATH;

  const merge = options?.merge !== false;
  let existing: CrawledVideo[] = [];

  if (merge) {
    const file = await getFile(owner, repoName, path, branch);
    if (file) {
      try {
        const decoded = Buffer.from(file.content, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded) as unknown;
        const arr = Array.isArray(parsed) ? parsed : (parsed as { videos?: unknown[] }).videos ?? [];
        existing = arr
          .filter((v): v is CrawledVideo => v != null && typeof v === "object" && !!(v as CrawledVideo).id)
          .map((v) => v as CrawledVideo);
      } catch {
        existing = [];
      }
    }
  }

  const byId = new Map<string | undefined, CrawledVideo>();
  for (const v of existing) {
    if (v.id) byId.set(v.id, v);
  }
  for (const v of newVideos) {
    if (v.id) byId.set(v.id, v);
  }

  const merged = Array.from(byId.values()).filter((v) => v.id && v.outboundUrl);
  const content = JSON.stringify(merged.map(toStored), null, 2);

  try {
    const file = await getFile(owner, repoName, path, branch);
    await putFile(
      owner,
      repoName,
      path,
      {
        sha: file?.sha,
        content,
        message: `Update crawled videos (${newVideos.length} new, ${merged.length} total)`,
      },
      branch
    );
  } catch (err) {
    const fs = await import("fs/promises");
    const pathModule = await import("path");
    const localPath = pathModule.join(process.cwd(), path);
    await fs.mkdir(pathModule.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, content, "utf-8");
    console.warn(
      "GitHub API failed, saved locally to",
      localPath,
      "- commit and push to publish. Error:",
      err instanceof Error ? err.message : err
    );
  }

  return { saved: newVideos.length, total: merged.length };
}
