"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ContentWrapper from "./ContentWrapper";
import BackButton from "./BackButton";
import AdSlot from "./AdSlot";
import VideosListClient from "./VideosListClient";
import VideoDetailClient from "./VideoDetailClient";
import { getVideos as getMockVideos, getVideoById } from "@/lib/videos";
import {
  getVideosFromFirestore,
  getVideoByIdFromFirestore,
} from "@/lib/firestoreVideos";
import type { Video } from "@/types/video";

export default function VideosPageClient() {
  const searchParams = useSearchParams();
  const watchId = searchParams.get("watch");
  const [videos, setVideos] = useState<Video[]>(getMockVideos());
  const [watchVideo, setWatchVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchLoading, setWatchLoading] = useState(!!watchId);

  // Fetch list: mock + Firestore
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const run = async () => {
      const mock = getMockVideos();
      try {
        const fromFs = await getVideosFromFirestore(100);
        const byId = new Map<string, Video>();
        [...mock, ...fromFs].forEach((v) => byId.set(v.id, v));
        const merged = Array.from(byId.values()).sort(
          (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );
        if (!cancelled) setVideos(merged);
      } catch {
        if (!cancelled) setVideos(mock);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch single video when ?watch=id
  useEffect(() => {
    if (!watchId) {
      setWatchVideo(null);
      setWatchLoading(false);
      return;
    }
    let cancelled = false;
    setWatchLoading(true);
    const run = async () => {
      const fromMock = getVideoById(watchId);
      if (fromMock) {
        if (!cancelled) {
          setWatchVideo(fromMock);
          setWatchLoading(false);
        }
        return;
      }
      try {
        const v = await getVideoByIdFromFirestore(watchId);
        if (!cancelled) setWatchVideo(v ?? null);
      } catch {
        if (!cancelled) setWatchVideo(null);
      } finally {
        if (!cancelled) setWatchLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [watchId]);

  if (watchId) {
    if (watchLoading) {
      return (
        <div className="min-h-screen px-4 py-20 text-center">
          <p className="font-bangla text-white/70">লোড হচ্ছে...</p>
        </div>
      );
    }
    return <VideoDetailClient video={watchVideo} />;
  }

  return (
    <ContentWrapper className="min-h-screen py-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/" label="হোম" />
      </div>
      <div className="mb-6">
        <AdSlot placement="videos-top" />
      </div>

      <h1 className="font-bangla mb-6 text-2xl font-bold text-white md:text-3xl">
        বাংলা ভিডিও
      </h1>

      {loading ? (
        <p className="font-bangla text-white/60">লোড হচ্ছে...</p>
      ) : (
        <VideosListClient videos={videos} />
      )}
    </ContentWrapper>
  );
}
