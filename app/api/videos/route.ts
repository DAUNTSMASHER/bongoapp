/**
 * GET /api/videos
 * Returns active videos from Firestore (server-side).
 * Query: ?limit=100
 */

import { NextResponse } from "next/server";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import type { Video } from "@/types/video";

function toVideo(doc: DocumentSnapshot): Video {
  const d = doc.data()!;
  const createdAt = d.createdAt?.toDate?.() ?? new Date();
  return {
    id: d.id || doc.id,
    title: d.title || "Video",
    thumbnailUrl: d.thumbnailUrl || "",
    outboundUrl: d.outboundUrl || "",
    embedUrl: d.embedUrl ?? undefined,
    directVideoUrl: d.directVideoUrl ?? undefined,
    tags: Array.isArray(d.tags) ? d.tags : [],
    language: d.language || "bn",
    sourceSite: d.sourceSite,
    status: d.status === "hidden" ? "hidden" : "active",
    createdAt,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitCount = Math.min(parseInt(searchParams.get("limit") || "100", 10) || 100, 200);

    const firestore = initFirestore();

    let snap;
    try {
      snap = await firestore
        .collection("videos")
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get();
    } catch {
      // Fallback: fetch without orderBy if index missing or createdAt absent
      snap = await firestore.collection("videos").limit(limitCount).get();
    }

    const videos: Video[] = snap.docs
      .map((doc) => toVideo(doc))
      .filter((v) => v.status === "active")
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

    return NextResponse.json({ videos });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch videos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
