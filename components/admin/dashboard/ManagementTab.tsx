"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminCard } from "../AdminCard";
import { CATEGORIES } from "@/lib/stories";
import { adminFetch } from "@/lib/adminApi";

interface ManagedStory {
  id: string;
  title: string;
  headline: string;
  status: string;
  categorySlug: string;
}

export function ManagementTab() {
  const [stories, setStories] = useState<ManagedStory[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLoad(e?: React.FormEvent) {
    e?.preventDefault?.();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (category) params.set("categorySlug", category);
      if (status) params.set("status", status);
      const { ok, data, error: err } = await adminFetch(`/api/admin/stories-management?${params}`);
      if (!ok) throw new Error(err || (data.error as string) || "Load failed");
      setStories((data.stories as unknown as ManagedStory[]) || []);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(stories.map((s) => s.id)) : new Set());
  }

  function handleToggle(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    setDeleteLoading(true);
    setError(null);
    setResult(null);
    try {
      const { ok, data, error: err } = await adminFetch("/api/admin/delete-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyIds: Array.from(selected) }),
      });
      if (!ok) throw new Error(err || (data.error as string) || "Delete failed");
      setResult((data.message as string) || `Deleted ${selected.size} stories.`);
      setSelected(new Set());
      await handleLoad();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (!confirm("Delete ALL stories? This cannot be undone.")) return;
    setDeleteLoading(true);
    setError(null);
    setResult(null);
    try {
      const { ok, data, error: err } = await adminFetch("/api/admin/delete-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
      if (!ok) throw new Error(err || (data.error as string) || "Delete failed");
      setResult((data.message as string) || "All stories deleted.");
      setStories([]);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Auto-load on mount
  useEffect(() => {
    handleLoad();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status]);

  return (
    <AdminCard
      title="Story Management"
      description="List, select, delete, or edit stories. Load by category and status."
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-white/60">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => handleLoad()}
          disabled={loading}
          className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">{error}</div>}
      {result && <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-green-300">{result}</div>}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={stories.length > 0 && selected.size === stories.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded"
          />
          Select all
        </label>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={selected.size === 0 || deleteLoading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {deleteLoading ? "Deleting…" : `Delete selected (${selected.size})`}
        </button>
        <span className="text-white/30">|</span>
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={deleteLoading}
          title="Permanently delete all stories. Cannot be undone."
          className="rounded-lg border border-red-900/80 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 disabled:opacity-50"
        >
          Delete ALL
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
            {stories.map((s) => (
              <tr key={s.id} className="border-b border-white/5">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={(e) => handleToggle(s.id, e.target.checked)}
                    className="rounded"
                  />
                </td>
                <td className="max-w-[140px] truncate px-4 py-2 font-mono text-xs text-white/70">{s.id}</td>
                <td className="max-w-[200px] truncate px-4 py-2 text-white">{s.title || s.headline || "—"}</td>
                <td className="px-4 py-2 text-white/70">{s.categorySlug || "—"}</td>
                <td className="px-4 py-2 text-white/70">{s.status || "draft"}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/stories/edit/?storyId=${encodeURIComponent(s.id)}`} className="text-[var(--primary)] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stories.length === 0 && !loading && (
          <p className="px-4 py-8 text-center text-white/50">No stories loaded. Use filters and click &quot;Load Stories&quot;.</p>
        )}
      </div>
    </AdminCard>
  );
}
