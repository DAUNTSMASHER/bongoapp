"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminDropZone } from "@/components/admin/AdminDropZone";
import { uploadFile } from "@/lib/uploadToStorage";
import { adminFetch } from "@/lib/adminApi";
import { VideoIcon } from "@/components/icons";

export default function AddVideoPage() {
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [directVideoUrl, setDirectVideoUrl] = useState("");
  const [outboundUrl, setOutboundUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  async function handleUploadThumb() {
    if (!thumbnailFile) return;
    setThumbUploading(true);
    setError(null);
    try {
      const url = await uploadFile(thumbnailFile, "video_thumb");
      setThumbnailUrl(url);
      setThumbnailFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thumbnail upload failed");
    } finally {
      setThumbUploading(false);
    }
  }

  async function handleUploadVideo() {
    if (!videoFile) return;
    setVideoUploading(true);
    setError(null);
    try {
      const url = await uploadFile(videoFile, "videos");
      setDirectVideoUrl(url);
      setVideoFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setVideoUploading(false);
    }
  }

  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith("video/") || file.type === "application/octet-stream")) {
      setVideoFile(file);
    }
    e.target.value = "";
  }

  function handleVideoDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("video/") || file.type === "application/octet-stream")) {
      setVideoFile(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!title.trim() || !outboundUrl.trim()) {
      setError("Title and outbound URL (link to video page) are required.");
      return;
    }
    const finalThumb = thumbnailUrl.trim() || outboundUrl;
    if (thumbnailFile && !thumbnailUrl.trim()) {
      setError("Upload thumbnail first, or paste URL.");
      return;
    }
    setLoading(true);
    try {
      const { ok, data, error } = await adminFetch("/api/admin/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          thumbnailUrl: finalThumb,
          outboundUrl: outboundUrl.trim(),
          embedUrl: embedUrl.trim() || undefined,
          directVideoUrl: directVideoUrl.trim() || undefined,
        }),
      });
      if (!ok) throw new Error(error || (data.error as string) || "Failed to create");
      setSuccess(`Video created. ID: ${data.id}`);
      setTitle("");
      setThumbnailUrl("");
      setThumbnailFile(null);
      setVideoFile(null);
      setDirectVideoUrl("");
      setOutboundUrl("");
      setEmbedUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Add Video"
        description="Upload a video with custom thumbnail. Like YouTube — add thumbnail and optional video file."
        backHref="/admin/videos/edit/"
        backLabel="Edit videos"
      />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* YouTube-style: Thumbnail + Video upload side by side */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard title="Thumbnail" description="Preview image (16:9 recommended)">
              <AdminDropZone
                value={thumbnailUrl}
                onFileSelect={setThumbnailFile}
                onUrlChange={setThumbnailUrl}
                onUpload={handleUploadThumb}
                uploading={thumbUploading}
                selectedFile={thumbnailFile}
                aspectRatio="video"
                label=""
                placeholder="Drag & drop thumbnail or click"
                disabled={loading}
              />
            </AdminCard>

            <AdminCard title="Video file (optional)" description="Upload .mp4 or .webm — self-hosted playback">
              <div
                onClick={() => videoInputRef.current?.click()}
                onDrop={handleVideoDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-white/[0.02] transition-all hover:border-white/30 hover:bg-white/5"
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                {videoFile ? (
                  <div className="flex flex-col items-center gap-2 p-4">
                    <VideoIcon size={40} className="text-white/60" />
                    <p className="text-center text-sm text-white/90">{videoFile.name}</p>
                    <p className="text-xs text-white/50">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadVideo();
                      }}
                      disabled={videoUploading}
                      className="mt-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {videoUploading ? "Uploading…" : "Upload video"}
                    </button>
                  </div>
                ) : directVideoUrl ? (
                  <div className="flex flex-col items-center gap-2 p-4">
                    <VideoIcon size={40} className="text-green-500/80" />
                    <p className="text-center text-sm text-green-400">Video URL ready</p>
                    <p className="max-w-full truncate text-xs text-white/50" title={directVideoUrl}>
                      {directVideoUrl.slice(0, 50)}…
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDirectVideoUrl("");
                      }}
                      className="mt-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <VideoIcon size={40} className="text-white/50" />
                    <p className="text-center text-sm text-white/70">
                      Click or drag video file
                    </p>
                    <p className="text-xs text-white/50">MP4, WebM up to 100MB</p>
                  </>
                )}
              </div>
            </AdminCard>
          </div>

          <AdminCard title="Video details">
            <div className="space-y-5">
              <AdminFormField
                label="Title"
                hint="Display name for the video"
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  disabled={loading}
                />
              </AdminFormField>
              <AdminFormField
                label="Outbound URL *"
                hint="Link to external video page (e.g. YouTube, pornhub)"
              >
                <input
                  type="url"
                  value={outboundUrl}
                  onChange={(e) => setOutboundUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  disabled={loading}
                  required
                />
              </AdminFormField>
              <AdminFormField
                label="Embed URL (optional)"
                hint="For iframe embed"
              >
                <input
                  type="url"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  disabled={loading}
                />
              </AdminFormField>
              <AdminFormField
                label="Direct video URL (optional)"
                hint="From uploaded file or external .mp4 link"
              >
                <input
                  type="url"
                  value={directVideoUrl}
                  onChange={(e) => setDirectVideoUrl(e.target.value)}
                  placeholder="https://.../.mp4"
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
              {loading ? "Creating…" : "Create video"}
            </button>
            <Link
              href="/admin/videos/edit/"
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
