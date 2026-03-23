"use client";

import { useState } from "react";
import Link from "next/link";
import ContentWrapper from "@/components/ContentWrapper";
import { adminFetch } from "@/lib/adminApi";

interface VideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  outboundUrl: string;
  embedUrl: string;
  directVideoUrl: string;
  tags: string[];
}

export default function EditVideoPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoData | null>(null);
  const [form, setForm] = useState<VideoData | null>(null);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!id.trim()) return;
    setLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/get-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.trim() }),
      });
      if (!ok) throw new Error(error || (data?.error as string) || "Failed to load");
      const videoData = data?.video as VideoData | undefined;
      if (videoData) {
        setVideo(videoData);
        setForm(videoData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
      setVideo(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/update-video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          thumbnailUrl: form.thumbnailUrl,
          outboundUrl: form.outboundUrl,
          embedUrl: form.embedUrl,
          directVideoUrl: form.directVideoUrl,
          tags: form.tags,
        }),
      });
      if (!ok) throw new Error(error || (data?.error as string) || "Update failed");
      setVideo(form);
      setSuccess("Video updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ContentWrapper className="min-h-screen py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard/" className="text-white/70 hover:text-white">
          ← Dashboard
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Video</h1>

      {!form ? (
        <>
          <p className="mb-4 text-sm text-white/60">
            Enter the video ID (Firestore document ID) to load and edit.
          </p>
          <form onSubmit={handleLoad} className="max-w-xl space-y-4">
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Video ID"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load Video"}
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </>
      ) : (
        <>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">ID</label>
              <input
                type="text"
                value={form.id}
                readOnly
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Title (name)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Thumbnail URL</label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Outbound URL</label>
              <input
                type="url"
                value={form.outboundUrl}
                onChange={(e) => setForm({ ...form, outboundUrl: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Embed URL</label>
              <input
                type="url"
                value={form.embedUrl}
                onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Direct video URL</label>
              <input
                type="url"
                value={form.directVideoUrl}
                onChange={(e) => setForm({ ...form, directVideoUrl: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(form.tags) ? form.tags.join(", ") : ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="tag1, tag2"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideo(null);
                  setForm(null);
                  setId("");
                  setError(null);
                  setSuccess(null);
                }}
                className="rounded-lg border border-white/20 px-6 py-3 text-white/80 hover:bg-white/10"
              >
                Load another
              </button>
            </div>
          </form>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {success && <p className="mt-4 text-sm text-green-400">{success}</p>}
        </>
      )}
    </ContentWrapper>
  );
}
