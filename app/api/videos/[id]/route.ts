/**
 * GET /api/videos/[id]
 * Returns a single video by ID from Firestore (server-side).
 */

import { NextResponse } from "next/server";

export const revalidate = 60;
const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=120";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import type { Video } from "@/types/video";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const firestore = initFirestore();
    const doc = await firestore.collection("videos").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const d = doc.data()!;
    const createdAt = d.createdAt?.toDate?.() ?? new Date();
    const video: Video = {
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

    const res = NextResponse.json({ video });
    res.headers.set("Cache-Control", CACHE_CONTROL);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch video";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
