"use client";

import { useState } from "react";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import { CATEGORIES } from "@/lib/stories";
import { useAdminAuth, signOut, addAdminEmail } from "@/hooks/useAdminAuth";
import { INITIAL_ADMIN_EMAIL } from "@/lib/adminAuth";

interface VideoCrawlResult {
  extracted: number;
  inserted: number;
  skipped: number;
  message: string;
}

interface StoryCrawlResult {
  extracted: number;
  inserted: number;
  skipped?: number;
  message: string;
}

interface PublishResult {
  published: number;
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

interface ManagedStory {
  id: string;
  title: string;
  headline: string;
  status: string;
  categorySlug: string;
}

type TabId = "videos" | "stories" | "management";

export default function AdminDashboardPage() {
  const { user, adminEmails, refreshAdmins } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabId>("videos");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminResult, setAddAdminResult] = useState<string | null>(null);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  const [url, setUrl] = useState("https://www.banglachotikahinii.com/videos/latest-updates/");
  const [videoBatchSize, setVideoBatchSize] = useState(100);
  const [videoUsePuppeteer, setVideoUsePuppeteer] = useState(true); // needed for sites that load video URLs via JS
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoCrawlResult | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

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
  const [linksResult, setLinksResult] = useState<{ extracted: number; inserted: number; skipped: number; message: string } | null>(null);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchVideos, setSearchVideos] = useState<SearchVideo[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [publishVideosLoading, setPublishVideosLoading] = useState(false);
  const [publishVideosResult, setPublishVideosResult] = useState<{ inserted: number; skipped: number; message: string } | null>(null);

  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<{ processed: number; enhanced: number; message: string } | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const [fetchInspectUrl, setFetchInspectUrl] = useState("https://www.banglachotikahinii.com/category/bangla-couple-sex-story/?asgtbndr=1");
  const [fetchInspectCount, setFetchInspectCount] = useState(2);
  const [fetchInspectLoading, setFetchInspectLoading] = useState(false);
  const [fetchInspectResult, setFetchInspectResult] = useState<{ stories: unknown[]; extracted: number; successRate: string } | null>(null);
  const [fetchInspectError, setFetchInspectError] = useState<string | null>(null);

  const [mgmtStories, setMgmtStories] = useState<ManagedStory[]>([]);
  const [mgmtSelected, setMgmtSelected] = useState<Set<string>>(new Set());
  const [mgmtCategory, setMgmtCategory] = useState("");
  const [mgmtStatus, setMgmtStatus] = useState("");
  const [mgmtLoading, setMgmtLoading] = useState(false);
  const [mgmtDeleteLoading, setMgmtDeleteLoading] = useState(false);
  const [mgmtResult, setMgmtResult] = useState<string | null>(null);
  const [mgmtError, setMgmtError] = useState<string | null>(null);

  async function handleLoadMgmtStories(e?: React.FormEvent) {
    e?.preventDefault();
    setMgmtError(null);
    setMgmtResult(null);
    setMgmtLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (mgmtCategory) params.set("categorySlug", mgmtCategory);
      if (mgmtStatus) params.set("status", mgmtStatus);
      const res = await fetch(`/api/admin/stories-management?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMgmtStories(data.stories || []);
      setMgmtSelected(new Set());
    } catch (err) {
      setMgmtError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setMgmtLoading(false);
    }
  }

  function handleMgmtSelectAll(checked: boolean) {
    if (checked) {
      setMgmtSelected(new Set(mgmtStories.map((s) => s.id)));
    } else {
      setMgmtSelected(new Set());
    }
  }

  function handleMgmtToggle(id: string, checked: boolean) {
    const next = new Set(mgmtSelected);
    if (checked) next.add(id);
    else next.delete(id);
    setMgmtSelected(next);
  }

  async function handleMgmtDeleteSelected() {
    if (mgmtSelected.size === 0) return;
    setMgmtDeleteLoading(true);
    setMgmtError(null);
    setMgmtResult(null);
    try {
      const res = await fetch("/api/admin/delete-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyIds: Array.from(mgmtSelected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setMgmtResult(data.message || `Deleted ${mgmtSelected.size} stories.`);
      setMgmtSelected(new Set());
      await handleLoadMgmtStories();
    } catch (err) {
      setMgmtError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setMgmtDeleteLoading(false);
    }
  }

  async function handleMgmtDeleteAll() {
    if (!confirm("Delete ALL stories? This cannot be undone.")) return;
    setMgmtDeleteLoading(true);
    setMgmtError(null);
    setMgmtResult(null);
    try {
      const res = await fetch("/api/admin/delete-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setMgmtResult(data.message || "All stories deleted.");
      setMgmtStories([]);
      setMgmtSelected(new Set());
    } catch (err) {
      setMgmtError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setMgmtDeleteLoading(false);
    }
  }

  async function handleFetchInspect(e: React.FormEvent) {
    e.preventDefault();
    setFetchInspectError(null);
    setFetchInspectResult(null);
    if (!fetchInspectUrl.trim()) return;
    setFetchInspectLoading(true);
    try {
      const res = await fetch("/api/admin/fetch-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fetchInspectUrl.trim(), count: fetchInspectCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setFetchInspectResult(data);
    } catch (err) {
      setFetchInspectError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setFetchInspectLoading(false);
    }
  }

  async function handleVideoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVideoError(null);
    setVideoResult(null);
    if (!url.trim()) return;
    setVideoLoading(true);
    try {
      const res = await fetch("/api/admin/crawl-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), maxVideos: videoBatchSize, batchSize: videoBatchSize, usePuppeteer: videoUsePuppeteer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setVideoResult(data);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setVideoLoading(false);
    }
  }

  function addStoryLog(level: "info" | "success" | "error", message: string) {
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
    addStoryLog("info", `Starting crawl: ${params.url} | category=${params.categorySlug} | count=${params.count} | smart=${params.smart}`);
    try {
      const res = await fetch("/api/admin/crawl-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const text = await res.text();
      addStoryLog("info", `Response status: ${res.status} ${res.statusText}`);
      let data: { error?: string; extracted?: number; inserted?: number; message?: string; skipped?: number };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        addStoryLog("error", `Invalid JSON response (length=${text.length}). Raw: ${text.slice(0, 200)}...`);
        const hint =
          res.status === 502 || res.status === 504
            ? "Crawl timed out or failed on Vercel. Set FIRECRAWL_API_KEY in Vercel env for cloud scraping, or run locally: npm run crawl:stories [url] [categorySlug] [count]"
            : "Server returned invalid response. For Vercel: set FIRECRAWL_API_KEY. Or run locally: npm run crawl:stories [url] [categorySlug] [count]";
        throw new Error(hint);
      }
      if (!res.ok) {
        addStoryLog("error", data.error || "Request failed");
        throw new Error(data.error || "Request failed");
      }
      addStoryLog(
        "success",
        `Done: extracted=${data.extracted ?? "?"} inserted=${data.inserted ?? "?"} skipped=${data.skipped ?? 0}`
      );
      setStoryResult(data as StoryCrawlResult);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      addStoryLog("error", msg);
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
    addStoryLog("info", `Extracting from ${urls.length} link(s)...`);
    try {
      const res = await fetch("/api/admin/crawl-stories-from-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, categorySlug }),
      });
      const text = await res.text();
      addStoryLog("info", `Response: ${res.status}`);
      let data: { error?: string; extracted?: number; inserted?: number; skipped?: number; message?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        addStoryLog("error", `Invalid response: ${text.slice(0, 100)}...`);
        throw new Error("Server returned invalid response. Ensure FIRECRAWL_API_KEY is set on Vercel.");
      }
      if (!res.ok) {
        addStoryLog("error", data.error || "Request failed");
        throw new Error(data.error || "Request failed");
      }
      addStoryLog("success", `Done: ${data.inserted ?? 0} saved, ${data.skipped ?? 0} skipped.`);
      setLinksResult({
        extracted: data.extracted ?? 0,
        inserted: data.inserted ?? 0,
        skipped: data.skipped ?? 0,
        message: data.message ?? "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extract failed";
      addStoryLog("error", msg);
      setLinksError(msg);
    } finally {
      setLinksLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/admin/login/";
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAddAdminError(null);
    setAddAdminResult(null);
    if (!newAdminEmail.trim() || !user?.email) return;
    setAddAdminLoading(true);
    try {
      await addAdminEmail(newAdminEmail.trim());
      await refreshAdmins();
      setAddAdminResult(`Admin ${newAdminEmail} added. They can now sign in.`);
      setNewAdminEmail("");
    } catch (err) {
      setAddAdminError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setAddAdminLoading(false);
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
      const res = await fetch("/api/admin/search-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim(), maxVideos: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setSearchVideos(data.videos || []);
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
      const res = await fetch("/api/admin/publish-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: searchVideos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setPublishVideosResult(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishVideosLoading(false);
    }
  }

  async function handleEnhance() {
    setEnhanceError(null);
    setEnhanceResult(null);
    setEnhanceLoading(true);
    try {
      const res = await fetch("/api/admin/enhance-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enhance failed");
      setEnhanceResult(data);
    } catch (err) {
      setEnhanceError(err instanceof Error ? err.message : "Enhance failed");
    } finally {
      setEnhanceLoading(false);
    }
  }

  async function handlePublish() {
    setPublishError(null);
    setPublishResult(null);
    setPublishLoading(true);
    try {
      const res = await fetch("/api/admin/publish-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug: categorySlug ? categorySlug : undefined }),
      });
      const text = await res.text();
      let data: { error?: string; published?: number; message?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "Server returned invalid response. Publish requires a server deployment. Deploy with Firebase Functions to use this feature."
        );
      }
      if (!res.ok) throw new Error(data.error || "Request failed");
      setPublishResult(data as PublishResult);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishLoading(false);
    }
  }

  const allAdmins = [INITIAL_ADMIN_EMAIL, ...adminEmails];

  return (
    <ContentWrapper className="min-h-screen py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Admin — Generate & Add Content
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">{user?.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Add Admin */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Add Admin</h2>
        <p className="mb-3 text-sm text-white/60">
          Add another admin by email. They must have a Firebase Auth account with this email.
        </p>
        <form onSubmit={handleAddAdmin} className="max-w-xl space-y-3">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="newadmin@example.com"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            disabled={addAdminLoading}
          />
          <button
            type="submit"
            disabled={addAdminLoading}
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {addAdminLoading ? "Adding..." : "Add Admin"}
          </button>
        </form>
        {addAdminError && <p className="mt-2 text-sm text-red-400">{addAdminError}</p>}
        {addAdminResult && <p className="mt-2 text-sm text-green-400">{addAdminResult}</p>}
        <p className="mt-2 text-xs text-white/50">Current admins: {allAdmins.join(", ")}</p>
      </section>

      <hr className="my-10 border-white/10" />

      {/* Edit content links */}
      <section className="mb-8 flex flex-wrap gap-4">
        <Link
          href="/admin/stories/edit"
          className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-white/90 hover:bg-white/10"
        >
          Edit Stories (name, heading, body, cover image)
        </Link>
        <Link
          href="/admin/videos/edit"
          className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-white/90 hover:bg-white/10"
        >
          Edit Videos (name, URLs)
        </Link>
        <Link
          href="/admin/hot-chobi"
          className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-white/90 hover:bg-white/10"
        >
          Hot Chobi — upload, edit images
        </Link>
      </section>

      <hr className="my-10 border-white/10" />

      {/* Tabs: Videos vs Choti Stories */}
      <div className="mb-8 flex gap-2 border-b border-white/20 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("videos")}
          className={`rounded-lg px-6 py-2 font-medium transition-colors ${
            activeTab === "videos"
              ? "bg-primary text-white"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stories")}
          className={`rounded-lg px-6 py-2 font-medium transition-colors ${
            activeTab === "stories"
              ? "bg-primary text-white"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Choti Stories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("management")}
          className={`rounded-lg px-6 py-2 font-medium transition-colors ${
            activeTab === "management"
              ? "bg-primary text-white"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Story Management
        </button>
      </div>

      {/* Videos — separate from stories */}
      {activeTab === "videos" && (
      <>
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Videos</h2>
        <p className="mb-6 text-sm text-white/60">
          ভিডিও এবং গল্প আলাদা। ভিডিও ফেচ/সার্চ/পাবলিশ এখানে করুন।
        </p>
        <p className="mb-4 text-xs text-white/50">
          ভিডিও ফেচ ও সেভ করতে বাটনে ক্লিক করুন। এক ক্লিকেই অ্যাপে দেখাবে।
        </p>
        <form onSubmit={handleVideoSubmit} className="max-w-xl space-y-4">
          <div>
            <label htmlFor="url" className="mb-2 block text-sm font-medium text-white/80">
              Video listing URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/videos"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={videoLoading}
            />
          </div>
          <div>
            <label htmlFor="videoBatch" className="mb-2 block text-sm font-medium text-white/80">
              Batch size (৩–১০০)
            </label>
            <input
              id="videoBatch"
              type="number"
              min={3}
              max={100}
              value={videoBatchSize}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setVideoBatchSize(isNaN(v) ? 100 : Math.min(100, Math.max(3, v)));
              }}
              placeholder="100"
              className="w-24 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
              disabled={videoLoading}
            />
          </div>
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={videoUsePuppeteer}
              onChange={(e) => setVideoUsePuppeteer(e.target.checked)}
              disabled={videoLoading}
              className="rounded border-white/30"
            />
            <span>Use Puppeteer (ব্রাউজার ইমিউলেশন) — ভিডিও লিংক পেতে প্রয়োজন</span>
          </label>
          <button
            type="submit"
            disabled={videoLoading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {videoLoading ? "লোড হচ্ছে..." : "ভিডিও ফেচ ও সংরক্ষণ"}
          </button>
        </form>
        {videoError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {videoError}
          </div>
        )}
        {videoResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">Videos added successfully</p>
            <p className="mt-2">{videoResult.message}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span>Extracted: {videoResult.extracted}</span>
              <span>Added: {videoResult.inserted}</span>
              <span>Skipped: {videoResult.skipped}</span>
            </div>
          </div>
        )}
      </section>

      <hr className="my-10 border-white/10" />

      {/* Search Videos */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Search & Add Videos</h2>
        <p className="mb-4 text-xs text-white/50">
          সার্চ টার্ম লিখে ওয়েবে ভিডিও খুঁজুন। ৩০টি পর্যন্ত ভিডিও খুঁজে পাবলিশ করুন।
        </p>
        <form onSubmit={handleSearchVideos} className="max-w-xl space-y-4">
          <div>
            <label htmlFor="searchQuery" className="mb-2 block text-sm font-medium text-white/80">
              Search term
            </label>
            <input
              id="searchQuery"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. bangla porn bangladeshi sex"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={searchLoading}
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {searchLoading ? "খুঁজছি..." : "Search & Fetch"}
          </button>
        </form>
        {searchError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {searchError}
          </div>
        )}
        {searchVideos.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm text-green-300">
              {searchVideos.length} ভিডিও পাওয়া গেছে। পাবলিশ করতে ক্লিক করুন।
            </p>
            <button
              type="button"
              onClick={handlePublishVideos}
              disabled={publishVideosLoading}
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
            >
              {publishVideosLoading ? "সেভ হচ্ছে..." : "Publish " + searchVideos.length + " Videos"}
            </button>
          </div>
        )}
        {publishVideosResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">{publishVideosResult.message}</p>
          </div>
        )}
        <p className="mt-4 text-xs text-white/40">
          Requires SERPER_API_KEY. Batch processing reduces pressure.
        </p>
      </section>
      </>
      )}

      {/* Choti Stories — separate from videos */}
      {activeTab === "stories" && (
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Choti Stories (Bangla)</h2>
        <p className="mb-6 text-sm text-white/60">
          গল্প ভিডিও থেকে আলাদা। গল্প ক্রল ও পাবলিশ এখানে করুন। ব্যাচ সিস্টেম চাপ কমায়।
        </p>
        <form onSubmit={handleStorySubmit} className="max-w-xl space-y-4">
          <div>
            <label htmlFor="storyUrl" className="mb-2 block text-sm font-medium text-white/80">
              Website URL (e.g. https://www.banglachotikahinii.com/)
            </label>
            <input
              id="storyUrl"
              type="url"
              value={storyUrl}
              onChange={(e) => setStoryUrl(e.target.value)}
              placeholder="https://www.banglachotikahinii.com/"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-white/80">
              Category
            </label>
            <select
              id="category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="count" className="mb-2 block text-sm font-medium text-white/80">
              Number to add (1–100)
            </label>
            <input
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 40)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={storyLoading}
            />
          </div>
          <div>
            <label htmlFor="storyBatch" className="mb-2 block text-sm font-medium text-white/80">
              Batch size (১–২০) — চাপ কমাতে
            </label>
            <input
              id="storyBatch"
              type="number"
              min={1}
              max={20}
              value={storyBatchSize}
              onChange={(e) => setStoryBatchSize(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 10)))}
              className="w-24 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white"
              disabled={storyLoading}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={storySmartCrawl}
              onChange={(e) => setStorySmartCrawl(e.target.checked)}
              disabled={storyLoading}
              className="rounded border-white/30"
            />
            <span>Smart crawl — ML-style extraction (character names, erotic tags, storyId deduplication, category propagation)</span>
          </label>
          <button
            type="submit"
            disabled={storyLoading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {storyLoading ? "Crawling..." : "Generate and Add Stories"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-white/10 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <span className="text-sm font-medium text-white/80">Crawl logs</span>
            <button
              type="button"
              onClick={() => setStoryLogs([])}
              className="rounded px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white/90"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-3 font-mono text-xs">
            {storyLogs.length === 0 ? (
              <p className="text-white/40">Logs will appear here when you run a crawl.</p>
            ) : (
              storyLogs.map((log, i) => (
                <div
                  key={i}
                  className={`mb-1 flex gap-2 break-all ${
                    log.level === "error"
                      ? "text-red-400"
                      : log.level === "success"
                        ? "text-green-400"
                        : "text-white/70"
                  }`}
                >
                  <span className="shrink-0 text-white/50">[{log.ts}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {storyError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {storyError}
          </div>
        )}
        {storyResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">Stories added as draft</p>
            <p className="mt-2">{storyResult.message}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span>Extracted: {storyResult.extracted}</span>
              <span>Saved: {storyResult.inserted}</span>
              {typeof storyResult.skipped === "number" && <span>Skipped (duplicates): {storyResult.skipped}</span>}
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-white/40">
          Same as button: run locally <code className="rounded bg-white/10 px-1">npm run crawl:stories</code> with
          args <code className="rounded bg-white/10 px-1">[url] [categorySlug] [count]</code> if API fails (e.g. on Vercel).
        </p>

        <div className="mt-10 border-t border-white/10 pt-6">
          <h3 className="mb-2 text-sm font-medium text-white/80">Extract from multiple links</h3>
          <p className="mb-3 text-xs text-white/50">
            Paste story URLs (one per line or comma-separated). Each link is a story page. Extracted stories are saved as draft. Max 50 per run.
          </p>
          <form onSubmit={handleLinksSubmit} className="max-w-2xl space-y-3">
            <textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder={`https://www.banglachotikahinii.com/kajer-meye-bangla-choti/shiuli-amar-fantasy-bou-4/\nhttps://www.banglachotikahinii.com/...\n...`}
              rows={6}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none"
              disabled={linksLoading}
            />
            <div className="flex items-center gap-4">
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
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {linksLoading ? "Extracting..." : "Extract & Save"}
              </button>
            </div>
          </form>
          {linksError && (
            <p className="mt-2 text-sm text-red-400">{linksError}</p>
          )}
          {linksResult && (
            <div className="mt-3 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-green-100">
              <p className="font-medium">{linksResult.message}</p>
              <p className="mt-1 text-sm">Extracted: {linksResult.extracted} · Saved: {linksResult.inserted} · Skipped: {linksResult.skipped}</p>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <h3 className="mb-2 text-sm font-medium text-white/80">Fetch & Inspect (no save)</h3>
          <p className="mb-3 text-xs text-white/50">
            Fetches stories from URL (Vercel Linux env). Quality filter: min 1000 chars, no CTA endings. Returns JSON to inspect.
          </p>
          <form onSubmit={handleFetchInspect} className="max-w-xl space-y-3">
            <input
              type="url"
              value={fetchInspectUrl}
              onChange={(e) => setFetchInspectUrl(e.target.value)}
              placeholder="https://www.banglachotikahinii.com/category/..."
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40"
              disabled={fetchInspectLoading}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm text-white/70">
                Count:{" "}
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={fetchInspectCount}
                  onChange={(e) => setFetchInspectCount(Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 2)))}
                  className="w-14 rounded border border-white/20 bg-white/5 px-2 py-1 text-white"
                />
              </label>
              <button
                type="submit"
                disabled={fetchInspectLoading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                {fetchInspectLoading ? "Fetching..." : "Fetch & Inspect"}
              </button>
            </div>
          </form>
          {fetchInspectError && <p className="mt-2 text-sm text-red-400">{fetchInspectError}</p>}
          {fetchInspectResult && (
            <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-white/10 bg-black/40 p-4">
              <p className="mb-2 text-sm text-green-300">
                {fetchInspectResult.extracted} stories · Success rate: {fetchInspectResult.successRate}
              </p>
              <pre className="whitespace-pre-wrap break-words text-xs text-white/90">
                {JSON.stringify(fetchInspectResult.stories, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-white/80">Publish drafts</h3>
          <p className="mb-3 text-sm text-white/60">
            Publish all draft stories to make them live. Optionally filter by category.
          </p>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishLoading}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50"
          >
            {publishLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
        {publishError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {publishError}
          </div>
        )}
        {publishResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">{publishResult.message}</p>
          </div>
        )}

        <div className="mt-10 border-t border-white/10 pt-6">
          <h3 className="mb-2 text-sm font-medium text-white/80">Enhance stories (AI headlines, SEO, parts)</h3>
          <p className="mb-3 text-sm text-white/60">
            গল্পে হেডলাইন, SEO, হ্যাশট্যাগ ও ৪–৫ পার্টে ভাগ করুন। Ad slots পার্টের মাঝে দেখাবে।
          </p>
          <button
            type="button"
            onClick={handleEnhance}
            disabled={enhanceLoading}
            className="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {enhanceLoading ? "Enhancing..." : "Enhance Stories (30 max)"}
          </button>
        </div>
        {enhanceError && (
          <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {enhanceError}
          </div>
        )}
        {enhanceResult && (
          <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-4 text-green-100">
            <p className="font-semibold text-green-300">{enhanceResult.message}</p>
            <p className="mt-1 text-sm">Processed: {enhanceResult.processed} | Enhanced: {enhanceResult.enhanced}</p>
          </div>
        )}
      </section>
      )}

      {activeTab === "management" && (
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Story Management</h2>
        <p className="mb-4 text-sm text-white/70">
          List, select, delete, or edit stories. Runs on Vercel.
        </p>
        <form onSubmit={handleLoadMgmtStories} className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">Category</label>
            <select
              value={mgmtCategory}
              onChange={(e) => setMgmtCategory(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Status</label>
            <select
              value={mgmtStatus}
              onChange={(e) => setMgmtStatus(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={mgmtLoading}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {mgmtLoading ? "Loading..." : "Load Stories"}
          </button>
        </form>
        {mgmtError && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            {mgmtError}
          </div>
        )}
        {mgmtResult && (
          <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-green-300">
            {mgmtResult}
          </div>
        )}
        <div className="mb-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={mgmtStories.length > 0 && mgmtSelected.size === mgmtStories.length}
              onChange={(e) => handleMgmtSelectAll(e.target.checked)}
              className="rounded"
            />
            Select all
          </label>
          <button
            type="button"
            onClick={handleMgmtDeleteSelected}
            disabled={mgmtSelected.size === 0 || mgmtDeleteLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {mgmtDeleteLoading ? "Deleting..." : `Delete selected (${mgmtSelected.size})`}
          </button>
          <button
            type="button"
            onClick={handleMgmtDeleteAll}
            disabled={mgmtDeleteLoading}
            className="rounded-lg border border-red-500/60 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-50"
          >
            Delete ALL stories
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-2 text-left text-white/80">Select</th>
                <th className="px-4 py-2 text-left text-white/80">ID</th>
                <th className="px-4 py-2 text-left text-white/80">Title</th>
                <th className="px-4 py-2 text-left text-white/80">Category</th>
                <th className="px-4 py-2 text-left text-white/80">Status</th>
                <th className="px-4 py-2 text-left text-white/80">Edit</th>
              </tr>
            </thead>
            <tbody>
              {mgmtStories.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={mgmtSelected.has(s.id)}
                      onChange={(e) => handleMgmtToggle(s.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-2 font-mono text-xs text-white/70">{s.id}</td>
                  <td className="max-w-[200px] truncate px-4 py-2 text-white">{s.title || s.headline || "—"}</td>
                  <td className="px-4 py-2 text-white/70">{s.categorySlug || "—"}</td>
                  <td className="px-4 py-2 text-white/70">{s.status || "draft"}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`/admin/stories/edit?storyId=${encodeURIComponent(s.id)}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mgmtStories.length === 0 && !mgmtLoading && (
            <p className="px-4 py-8 text-center text-white/50">
              No stories loaded. Use filters and click &quot;Load Stories&quot;.
            </p>
          )}
        </div>
      </section>
      )}
    </ContentWrapper>
  );
}
