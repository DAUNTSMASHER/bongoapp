"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminDropZone } from "@/components/admin/AdminDropZone";
import { CATEGORIES } from "@/lib/stories";
import { uploadFile } from "@/lib/uploadToStorage";
import { adminFetch } from "@/lib/adminApi";

export function AddStoryTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState("uncategorized");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleUploadCover() {
    if (!coverFile) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", coverFile);
      const res = await fetch("/api/admin/upload-story-cover", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data?.url === "string") {
        setCoverImageUrl(data.url);
        setCoverFile(null);
        return;
      }
      if (res.status === 503 || res.status === 500) {
        const url = await uploadFile(coverFile, "story_cover");
        setCoverImageUrl(url);
        setCoverFile(null);
        return;
      }
      setError(typeof data?.error === "string" ? data.error : "Upload failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessId(null);
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    const finalCover = coverImageUrl.trim();
    if (coverFile && !finalCover) {
      setError("Upload failed. Try again, paste a URL below, or clear the file and submit without cover.");
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
          status: "published",
        }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Failed to create");
      setSuccessId(data.id as string);
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
    <div className="space-y-6">
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
            label="Story cover"
            placeholder="Click “Choose from PC” to pick an image, or drag & drop"
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
            {loading ? "Creating…" : "Publish Story"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {successId && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <p className="font-medium">Story is live and shows with the other stories.</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={`/stories/${successId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] underline hover:no-underline"
              >
                View this story →
              </a>
              <a
                href="/stories/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 underline hover:text-white"
              >
                View all stories
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
