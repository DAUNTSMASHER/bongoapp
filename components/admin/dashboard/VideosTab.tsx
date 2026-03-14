"use client";

import { useState } from "react";
import { AdminCard } from "../AdminCard";
import { AdminFormField } from "../AdminFormField";
import { adminFetch } from "@/lib/adminApi";

interface VideoCrawlResult {
  extracted: number;
  inserted: number;
  skipped: number;
  updated?: number;
  message: string;
}

interface SearchVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  outboundUrl: string;
  embedUrl?: string;
  directVideoUrl?: string;
  tags: string[];
  sourceSite: string;
}

export function VideosTab() {
  const [url, setUrl] = useState("https://www.banglachotikahinii.com/videos/latest-updates/");
  const [videoBatchSize, setVideoBatchSize] = useState(100);
  const [videoUsePuppeteer, setVideoUsePuppeteer] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoCrawlResult | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchVideos, setSearchVideos] = useState<SearchVideo[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [publishVideosLoading, setPublishVideosLoading] = useState(false);
  const [publishVideosResult, setPublishVideosResult] = useState<{ inserted: number; skipped: number; updated?: number; message: string } | null>(null);

  const [migrateVideoId, setMigrateVideoId] = useState("");
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrateResult, setMigrateResult] = useState<{ success: boolean; url?: string; message?: string } | null>(null);

  async function handleMigrateToBlob(e: React.FormEvent) {
    e.preventDefault();
    if (!migrateVideoId.trim()) return;
    setMigrateResult(null);
    setMigrateLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/migrate-video-to-blob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: migrateVideoId.trim() }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Migration failed");
      setMigrateResult({
        success: true,
        url: data.url as string,
        message: (data.message as string) || "Video migrated to Blob",
      });
    } catch (err) {
      setMigrateResult({
        success: false,
        message: err instanceof Error ? err.message : "Migration failed",
      });
    } finally {
      setMigrateLoading(false);
    }
  }

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVideoError(null);
    setVideoResult(null);
    if (!url.trim()) return;
    setVideoLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/crawl-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          maxVideos: videoBatchSize,
          batchSize: videoBatchSize,
          usePuppeteer: videoUsePuppeteer,
        }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Request failed");
      setVideoResult(data as unknown as VideoCrawlResult);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleSearchVideos(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setSearchVideos([]);
    setPublishVideosResult(null);
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/search-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), maxVideos: 30 }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Request failed");
      setSearchVideos((data.videos as SearchVideo[]) || []);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handlePublishVideos() {
    if (searchVideos.length === 0) return;
    setPublishVideosResult(null);
    setPublishVideosLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/publish-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: searchVideos }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Publish failed");
      setPublishVideosResult(data as unknown as { inserted: number; skipped: number; updated?: number; message: string });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishVideosLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <AdminCard
        title="Crawl Videos"
        description="Fetch videos from a listing URL. Existing videos are updated (no skip). Puppeteer needed for JS-rendered pages."
      >
        <form onSubmit={handleVideoSubmit} className="space-y-4">
          <AdminFormField label="Video listing URL">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/videos"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={videoLoading}
            />
          </AdminFormField>
          <AdminFormField label="Batch size (3–100)" hint="Number of videos per run">
            <input
              type="number"
              min={3}
              max={100}
              value={videoBatchSize}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setVideoBatchSize(isNaN(v) ? 100 : Math.min(100, Math.max(3, v)));
              }}
              className="w-24 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
              disabled={videoLoading}
            />
          </AdminFormField>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={videoUsePuppeteer}
              onChange={(e) => setVideoUsePuppeteer(e.target.checked)}
              disabled={videoLoading}
              className="rounded border-white/30"
            />
            Use Puppeteer (browser emulation)
          </label>
          <button
            type="submit"
            disabled={videoLoading}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {videoLoading ? "Crawling…" : "Fetch & Save Videos"}
          </button>
        </form>
        {videoError && <p className="mt-4 text-sm text-red-400">{videoError}</p>}
        {videoResult && (
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            <p className="font-semibold">{videoResult.message}</p>
            <p className="mt-2 text-sm">
              Extracted: {videoResult.extracted} · Added: {videoResult.inserted}
              {(videoResult.updated ?? 0) > 0 ? ` · Updated: ${videoResult.updated}` : ""}
              {videoResult.skipped > 0 ? ` · Skipped: ${videoResult.skipped}` : ""}
            </p>
          </div>
        )}
      </AdminCard>

      <AdminCard
        title="Search & Add Videos"
        description="Search the web for videos and publish up to 30. Requires SERPER_API_KEY."
      >
        <form onSubmit={handleSearchVideos} className="space-y-4">
          <AdminFormField label="Search term">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. bangla porn bangladeshi sex"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={searchLoading}
            />
          </AdminFormField>
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {searchLoading ? "Searching…" : "Search & Fetch"}
          </button>
        </form>
        {searchError && <p className="mt-4 text-sm text-red-400">{searchError}</p>}
        {searchVideos.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-green-300">{searchVideos.length} videos found.</p>
            <button
              type="button"
              onClick={handlePublishVideos}
              disabled={publishVideosLoading}
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
            >
              {publishVideosLoading ? "Publishing…" : `Publish ${searchVideos.length} Videos`}
            </button>
          </div>
        )}
        {publishVideosResult && (
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            <p className="font-semibold">{publishVideosResult.message}</p>
            {(publishVideosResult.updated ?? 0) > 0 && (
              <p className="mt-1 text-sm">Updated: {publishVideosResult.updated}</p>
            )}
          </div>
        )}
      </AdminCard>

      <AdminCard
        title="Host Videos on Your Site"
        description="Migrate videos to Vercel Blob so they play on bongochoti.com (no redirect). For batch migration, run: npm run migrate-videos"
      >
        <form onSubmit={handleMigrateToBlob} className="flex flex-wrap items-end gap-3">
          <AdminFormField label="Video ID (single)" hint="From Firestore or video URL slug">
            <input
              type="text"
              value={migrateVideoId}
              onChange={(e) => setMigrateVideoId(e.target.value)}
              placeholder="e.g. bck-bengali-college-meye"
              className="w-64 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
              disabled={migrateLoading}
            />
          </AdminFormField>
          <button
            type="submit"
            disabled={migrateLoading || !migrateVideoId.trim()}
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {migrateLoading ? "Migrating…" : "Migrate to Blob"}
          </button>
        </form>
        {migrateResult && (
          <div
            className={`mt-4 rounded-lg p-4 ${
              migrateResult.success
                ? "border border-green-500/30 bg-green-500/10 text-green-300"
                : "border border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            <p className="font-semibold">{migrateResult.success ? "✓ Migrated" : "Failed"}</p>
            {migrateResult.url && (
              <a
                href={migrateResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-sm underline"
              >
                {migrateResult.url}
              </a>
            )}
            {migrateResult.message && <p className="mt-1 text-sm">{migrateResult.message}</p>}
          </div>
        )}
        <p className="mt-4 text-xs text-white/50">
          Batch: <code className="rounded bg-white/10 px-1">npm run migrate-videos -- --limit 20</code>
        </p>
      </AdminCard>
    </div>
  );
}
