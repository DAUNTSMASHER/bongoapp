"use client";

import { useState } from "react";
import { AdminFormField } from "../AdminFormField";
import { CollapsibleSection } from "../CollapsibleSection";
import { CATEGORIES } from "@/lib/stories";
import { adminFetch } from "@/lib/adminApi";

interface StoryCrawlResult {
  extracted: number;
  inserted: number;
  skipped?: number;
  updated?: number;
  message: string;
}

interface PublishResult {
  published: number;
  message: string;
}

interface EnhanceResult {
  processed: number;
  enhanced: number;
  message: string;
}

export function StoriesTab() {
  const [storyUrl, setStoryUrl] = useState("https://www.banglachotikahinii.com/");
  const [categorySlug, setCategorySlug] = useState("bandhobi");
  const [count, setCount] = useState(20);
  const [storyBatchSize, setStoryBatchSize] = useState(10);
  const [storySmartCrawl, setStorySmartCrawl] = useState(true);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyResult, setStoryResult] = useState<StoryCrawlResult | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storyLogs, setStoryLogs] = useState<{ ts: string; level: "info" | "success" | "error"; message: string }[]>([]);

  const [linksText, setLinksText] = useState("");
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksResult, setLinksResult] = useState<{ extracted: number; inserted: number; skipped: number; updated?: number; message: string } | null>(null);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [fetchInspectUrl, setFetchInspectUrl] = useState("https://www.banglachotikahinii.com/category/bangla-couple-sex-story/?asgtbndr=1");
  const [fetchInspectCount, setFetchInspectCount] = useState(2);
  const [fetchInspectLoading, setFetchInspectLoading] = useState(false);
  const [fetchInspectResult, setFetchInspectResult] = useState<{ stories: unknown[]; extracted: number; successRate: string } | null>(null);
  const [fetchInspectError, setFetchInspectError] = useState<string | null>(null);

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<EnhanceResult | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [restoreBanglaLoading, setRestoreBanglaLoading] = useState(false);

  function addLog(level: "info" | "success" | "error", message: string) {
    const ts = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setStoryLogs((prev) => [...prev.slice(-99), { ts, level, message }]);
  }

  async function handleStorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setStoryError(null);
    setStoryResult(null);
    if (!storyUrl.trim() || !categorySlug) return;
    setStoryLoading(true);
    const params = {
      url: storyUrl.trim(),
      categorySlug,
      count: Math.min(Math.max(count, 1), 100),
      batchSize: storyBatchSize,
      smart: storySmartCrawl,
    };
    addLog("info", `Starting: ${params.url} | category=${params.categorySlug} | count=${params.count}`);
    try {
      const res = await fetch("/api/admin/crawl-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const text = await res.text();
      addLog("info", `Response: ${res.status} ${res.statusText}`);
      let data: { error?: string; extracted?: number; inserted?: number; message?: string; skipped?: number };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        addLog("error", `Invalid JSON. ${res.status === 502 || res.status === 504 ? "Timeout. Set FIRECRAWL_API_KEY on Vercel." : ""}`);
        throw new Error("Invalid response. Set FIRECRAWL_API_KEY or run locally: npm run crawl:stories");
      }
      if (!res.ok) {
        addLog("error", data.error || "Request failed");
        throw new Error(data.error || "Request failed");
      }
      addLog("success", `Done: extracted=${data.extracted ?? "?"} inserted=${data.inserted ?? "?"} skipped=${data.skipped ?? 0}`);
      setStoryResult(data as StoryCrawlResult);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Crawl failed";
      addLog("error", msg);
      setStoryError(msg);
    } finally {
      setStoryLoading(false);
    }
  }

  async function handleLinksSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLinksError(null);
    setLinksResult(null);
    const urls = linksText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));
    if (urls.length === 0) {
      setLinksError("Paste at least one valid story URL (one per line or comma-separated).");
      return;
    }
    if (!categorySlug) {
      setLinksError("Select a category.");
      return;
    }
    setLinksLoading(true);
    addLog("info", `Extracting from ${urls.length} link(s)...`);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/crawl-stories-from-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, categorySlug }),
      });
      if (!ok) {
        addLog("error", error || (data.error as string) || "Request failed");
        throw new Error(error || (data.error as string) || "Request failed");
      }
      const inserted = (data.inserted as number) ?? 0;
      const skipped = (data.skipped as number) ?? 0;
      const updated = (data.updated as number) ?? 0;
      addLog("success", `Done: ${inserted} saved, ${updated} updated, ${skipped} skipped.`);
      setLinksResult({
        extracted: (data.extracted as number) ?? 0,
        inserted,
        skipped,
        updated,
        message: (data.message as string) ?? "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extract failed";
      addLog("error", msg);
      setLinksError(msg);
    } finally {
      setLinksLoading(false);
    }
  }

  async function handleFetchInspect(e: React.FormEvent) {
    e.preventDefault();
    setFetchInspectError(null);
    setFetchInspectResult(null);
    if (!fetchInspectUrl.trim()) return;
    setFetchInspectLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/fetch-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fetchInspectUrl.trim(), count: fetchInspectCount }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Request failed");
      setFetchInspectResult(data as unknown as { stories: unknown[]; extracted: number; successRate: string });
    } catch (err) {
      setFetchInspectError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setFetchInspectLoading(false);
    }
  }

  async function handlePublish() {
    setPublishError(null);
    setPublishResult(null);
    setPublishLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/publish-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug: categorySlug || undefined }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Request failed");
      setPublishResult(data as unknown as PublishResult);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishLoading(false);
    }
  }

  async function handleEnhance() {
    setEnhanceError(null);
    setEnhanceResult(null);
    setEnhanceLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/enhance-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 30 }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Enhance failed");
      setEnhanceResult(data as unknown as EnhanceResult);
    } catch (err) {
      setEnhanceError(err instanceof Error ? err.message : "Enhance failed");
    } finally {
      setEnhanceLoading(false);
    }
  }

  async function handleRestoreBangla() {
    setEnhanceError(null);
    setEnhanceResult(null);
    setRestoreBanglaLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/enhance-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100, restoreBangla: true }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Restore failed");
      setEnhanceResult(data as unknown as EnhanceResult);
    } catch (err) {
      setEnhanceError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setRestoreBanglaLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <CollapsibleSection
        title="Crawl Stories"
        description="Fetch stories from a category URL. Saved as draft. Requires FIRECRAWL_API_KEY."
        step={1}
      >
        <form onSubmit={handleStorySubmit} className="space-y-4">
          <AdminFormField label="Website URL">
            <input
              type="text"
              value={storyUrl}
              onChange={(e) => setStoryUrl(e.target.value)}
              placeholder="https://www.banglachotikahinii.com/"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            />
          </AdminFormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminFormField label="Category">
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                disabled={storyLoading}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Count (1–100)">
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10) || 20)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                disabled={storyLoading}
              />
            </AdminFormField>
          </div>
          <AdminFormField label="Batch size (1–20)" hint="Smaller = less memory pressure">
            <input
              type="number"
              min={1}
              max={20}
              value={storyBatchSize}
              onChange={(e) => setStoryBatchSize(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 10)))}
              className="w-24 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
              disabled={storyLoading}
            />
          </AdminFormField>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={storySmartCrawl}
              onChange={(e) => setStorySmartCrawl(e.target.checked)}
              disabled={storyLoading}
              className="rounded border-white/30"
            />
            Smart crawl (character names, tags, deduplication)
          </label>
          <button
            type="submit"
            disabled={storyLoading}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {storyLoading ? "Crawling…" : "Crawl & Save Stories"}
          </button>
        </form>
        <div className="mt-4 rounded-lg border border-white/10 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="text-sm font-medium text-white/80">Logs</span>
            <button type="button" onClick={() => setStoryLogs([])} className="rounded px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white/90">
              Clear
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto p-3 font-mono text-xs">
            {storyLogs.length === 0 ? (
              <p className="text-white/40">Logs appear when you run a crawl.</p>
            ) : (
              storyLogs.map((log, i) => (
                <div
                  key={i}
                  className={`mb-1 flex gap-2 break-all ${
                    log.level === "error" ? "text-red-400" : log.level === "success" ? "text-green-400" : "text-white/70"
                  }`}
                >
                  <span className="shrink-0 text-white/50">[{log.ts}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
        {storyError && <p className="mt-4 text-sm text-red-400">{storyError}</p>}
        {storyResult && (
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            <p className="font-semibold">{storyResult.message}</p>
            <p className="mt-1 text-sm">
              Extracted: {storyResult.extracted} · Saved: {storyResult.inserted}
              {(storyResult as { updated?: number }).updated ? ` · Updated: ${(storyResult as { updated?: number }).updated}` : ""}
              {(storyResult.skipped ?? 0) > 0 ? ` · Skipped: ${storyResult.skipped}` : ""}
            </p>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Extract from Links"
        description="Paste story URLs (one per line, max 50). Same as crawl but from direct links."
        step={1}
        defaultOpen={false}
      >
        <form onSubmit={handleLinksSubmit} className="space-y-3">
          <textarea
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            placeholder={`https://example.com/story-1\nhttps://example.com/story-2`}
            rows={5}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
            disabled={linksLoading}
          />
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
              disabled={linksLoading}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={linksLoading || !categorySlug}
              className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {linksLoading ? "Extracting…" : "Extract & Save"}
            </button>
          </div>
        </form>
        {linksError && <p className="mt-2 text-sm text-red-400">{linksError}</p>}
        {linksResult && (
          <div className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            {linksResult.message}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Publish Drafts"
        description="Make draft stories visible on the site. Filter by category or publish all."
        step={2}
      >
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
            disabled={publishLoading}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishLoading}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
          >
            {publishLoading ? "Publishing…" : "Publish Drafts"}
          </button>
        </div>
        {publishError && <p className="mt-4 text-sm text-red-400">{publishError}</p>}
        {publishResult && <p className="mt-4 text-sm text-green-400">{publishResult.message}</p>}
      </CollapsibleSection>

      <CollapsibleSection
        title="Enhance & Tools"
        description="SEO headlines, hashtags, parts. Restore Bangla. Fetch & Inspect for testing."
        step={3}
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm text-white/80">Enhance published stories with better SEO metadata.</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleEnhance}
                disabled={enhanceLoading}
                className="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                {enhanceLoading ? "Enhancing…" : "Enhance (30 max)"}
              </button>
              <button
                type="button"
                onClick={handleRestoreBangla}
                disabled={restoreBanglaLoading}
                className="rounded-lg border border-amber-500/60 bg-amber-500/20 px-6 py-3 font-semibold text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
              >
                {restoreBanglaLoading ? "Restoring…" : "Restore Bangla Headlines"}
              </button>
            </div>
            {enhanceError && <p className="mt-4 text-sm text-red-400">{enhanceError}</p>}
            {enhanceResult && <p className="mt-4 text-sm text-green-400">{enhanceResult.message}</p>}
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-xs text-white/50">Developer: test extraction without saving.</p>
            <form onSubmit={handleFetchInspect} className="flex flex-wrap items-end gap-3">
              <input
                type="text"
                value={fetchInspectUrl}
                onChange={(e) => setFetchInspectUrl(e.target.value)}
                placeholder="https://example.com/category/..."
                className="min-w-[200px] flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40"
                disabled={fetchInspectLoading}
              />
              <input
                type="number"
                min={1}
                max={10}
                value={fetchInspectCount}
                onChange={(e) => setFetchInspectCount(Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 2)))}
                className="w-16 rounded border border-white/20 bg-white/5 px-2 py-2 text-white"
              />
              <button
                type="submit"
                disabled={fetchInspectLoading}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
              >
                {fetchInspectLoading ? "Fetching…" : "Fetch & Inspect"}
              </button>
            </form>
            {fetchInspectError && <p className="mt-2 text-sm text-red-400">{fetchInspectError}</p>}
            {fetchInspectResult && (
              <div className="mt-4 max-h-60 overflow-auto rounded-lg border border-white/10 bg-black/40 p-4">
                <p className="mb-2 text-sm text-green-300">{fetchInspectResult.extracted} stories · {fetchInspectResult.successRate}</p>
                <pre className="whitespace-pre-wrap break-words text-xs text-white/90">
                  {JSON.stringify(fetchInspectResult.stories, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
