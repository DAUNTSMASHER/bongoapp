"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminDropZone } from "@/components/admin/AdminDropZone";
import { CATEGORIES } from "@/lib/stories";
import { uploadFile } from "@/lib/uploadToStorage";
import { adminFetch } from "@/lib/adminApi";

export default function AddStoryPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState("uncategorized");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUploadCover() {
    if (!coverFile) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(coverFile, "story_cover");
      setCoverImageUrl(url);
      setCoverFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    const finalCover = coverImageUrl.trim();
    if (coverFile && !finalCover) {
      setError("Upload failed. Paste a URL (e.g. /story_cover/xxx.png) below, or cancel the file and submit without cover.");
      return;
    }
    setLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/create-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          categorySlug: categorySlug || "uncategorized",
          coverImageUrl: finalCover || undefined,
        }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Failed to create");
      setSuccess(`Story created and live. ID: ${data.id}`);
      setTitle("");
      setBody("");
      setCoverImageUrl("");
      setCoverFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Add Story"
        description="Create a new story with custom cover image. Upload or paste URL."
        backHref="/admin/stories/edit/"
        backLabel="Edit stories"
      />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <AdminCard title="Cover image" description="Story thumbnail (16:9 or 3:4 works best)">
            <AdminDropZone
              value={coverImageUrl}
              onFileSelect={setCoverFile}
              onUrlChange={setCoverImageUrl}
              onUpload={handleUploadCover}
              uploading={uploading}
              selectedFile={coverFile}
              aspectRatio="story"
              label=""
              placeholder="Drag & drop cover image or click to upload"
              disabled={loading}
            />
          </AdminCard>

          <AdminCard title="Story details">
            <div className="space-y-5">
              <AdminFormField label="Title">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Story title"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  disabled={loading}
                />
              </AdminFormField>
              <AdminFormField label="Category">
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  disabled={loading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </AdminFormField>
            </div>
          </AdminCard>

          <AdminCard title="Story content" description="Full story text (Bangla or English)">
            <AdminFormField label="Body">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Story content..."
                rows={14}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-bangla text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                disabled={loading}
              />
            </AdminFormField>
          </AdminCard>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create story"}
            </button>
            <Link
              href="/admin/stories/edit/"
              className="rounded-lg border border-white/20 px-6 py-3 text-white/80 transition-colors hover:bg-white/10"
            >
              Edit existing
            </Link>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
