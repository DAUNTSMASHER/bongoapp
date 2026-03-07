"use client";

import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import type { Video } from "@/types/video";

/**
 * Fetch videos from Firestore (client-side).
 * Used to show crawled videos in the app.
 */
export async function getVideosFromFirestore(limitCount = 100): Promise<Video[]> {
  const col = collection(db, "videos");
  const q = query(
    col,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  const videos: Video[] = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    const createdAt = d.createdAt?.toDate?.() || new Date(d.createdAt || Date.now());
    videos.push({
      id: d.id || doc.id,
      title: d.title || "Video",
      thumbnailUrl: d.thumbnailUrl || "",
      outboundUrl: d.outboundUrl || "",
      embedUrl: d.embedUrl || undefined,
      directVideoUrl: d.directVideoUrl || undefined,
      tags: Array.isArray(d.tags) ? d.tags : [],
      language: d.language || "bn",
      sourceSite: d.sourceSite,
      status: d.status === "hidden" ? "hidden" : "active",
      createdAt,
    });
  });
  return videos.filter((v) => v.status === "active");
}

/**
 * Fetch a single video by ID from Firestore.
 */
export async function getVideoByIdFromFirestore(id: string): Promise<Video | null> {
  const { doc, getDoc } = await import("firebase/firestore");
  const { db } = await import("./firebase");
  const docRef = doc(db, "videos", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const d = snap.data();
  const createdAt = d.createdAt?.toDate?.() || new Date();
  return {
    id: d.id || snap.id,
    title: d.title || "Video",
    thumbnailUrl: d.thumbnailUrl || "",
    outboundUrl: d.outboundUrl || "",
    embedUrl: d.embedUrl || undefined,
    directVideoUrl: d.directVideoUrl || undefined,
    tags: Array.isArray(d.tags) ? d.tags : [],
    language: d.language || "bn",
    sourceSite: d.sourceSite,
    status: d.status === "hidden" ? "hidden" : "active",
    createdAt,
  };
}
