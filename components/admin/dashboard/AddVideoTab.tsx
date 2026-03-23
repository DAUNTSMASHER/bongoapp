"use client";

import { useState } from "react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminDropZone } from "@/components/admin/AdminDropZone";
import { uploadFile } from "@/lib/uploadToStorage";
import { adminFetch } from "@/lib/adminApi";

export function AddVideoTab() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [directVideoUrl, setDirectVideoUrl] = useState("");
  
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUploadThumbnail() {
    if (!thumbnailFile) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", thumbnailFile);
      const res = await fetch("/api/admin/upload-story-cover", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data?.url === "string") {
        setThumbnailUrl(data.url);
        setThumbnailFile(null);
        return;
      }
      if (res.status === 503 || res.status === 500) {
        const url = await uploadFile(thumbnailFile, "video_thumbnails");
        setThumbnailUrl(url);
        setThumbnailFile(null);
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
    setSuccess(null);
    if (!title.trim() || (!embedUrl.trim() && !directVideoUrl.trim())) {
      setError("Title and at least one Video URL are required.");
      return;
    }
    const finalThumb = thumbnailUrl.trim();
    if (thumbnailFile && !finalThumb) {
      setError("Thumbnail upload failed. Try again, or clear the file.");
      return;
    }
    setLoading(true);
    try {
      // Create an array format expected by publish-videos endpoint
      const videoPayload = {
        videos: [{
          id: `manual-${Date.now()}`,
          title: title.trim(),
          thumbnailUrl: finalThumb || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=600",
          outboundUrl: directVideoUrl.trim() || embedUrl.trim(),
          embedUrl: embedUrl.trim() || undefined,
          directVideoUrl: directVideoUrl.trim() || undefined,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          sourceSite: "Manual Upload"
        }]
      };

      const { ok, data, error } = await adminFetch("/api/admin/publish-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoPayload),
      });
      
      if (!ok) throw new Error(error || (data.error as string) || "Failed to add video");
      
      setSuccess("Video successfully added to the platform.");
      setTitle("");
      setTags("");
      setEmbedUrl("");
      setDirectVideoUrl("");
      setThumbnailUrl("");
      setThumbnailFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add video failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <AdminCard title="Video Thumbnail" description="Cover image for the video (16:9 works best)">
          <AdminDropZone
            value={thumbnailUrl}
            onFileSelect={setThumbnailFile}
            onUrlChange={setThumbnailUrl}
            onUpload={handleUploadThumbnail}
            uploading={uploading}
            selectedFile={thumbnailFile}
            aspectRatio="video"
            label="Video thumbnail"
            placeholder="Click “Choose from PC” to pick an image, or drag & drop"
            disabled={loading}
          />
        </AdminCard>

        <AdminCard title="Video Details">
          <div className="space-y-5">
            <AdminFormField label="Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                disabled={loading}
              />
            </AdminFormField>
            
            <AdminFormField label="Tags (comma separated)">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="bangla, viral, hot"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                disabled={loading}
              />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="Video Source" description="Provide either an iframe embed URL or a direct video URL (.mp4, etc)">
          <div className="space-y-5">
            <AdminFormField label="Embed URL" hint="Example: https://www.youtube.com/embed/xxxxx">
              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://spankbang.com/.../embed/"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                disabled={loading}
              />
            </AdminFormField>
            <AdminFormField label="Direct Video URL" hint="Optional, for directly hosted .mp4 files">
              <input
                type="url"
                value={directVideoUrl}
                onChange={(e) => setDirectVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                disabled={loading}
              />
            </AdminFormField>
          </div>
        </AdminCard>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Saving…" : "Publish Video"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <p className="font-medium">{success}</p>
            <div className="mt-2">
              <a
                href="/videos/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] underline hover:no-underline"
              >
                View all videos →
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
