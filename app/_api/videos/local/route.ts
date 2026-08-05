/**
 * GET /api/videos/local
 * Returns local videos from public/Videos (no Firestore).
 */

import { NextResponse } from "next/server";
import { getLocalVideos } from "@/lib/localVideos";

export const revalidate = 3600;
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=7200";

export async function GET() {
  const videos = getLocalVideos();
  const res = NextResponse.json({
    videos: videos.map((v) => ({
      ...v,
      createdAt: v.createdAt?.toISOString?.() ?? new Date().toISOString(),
    })),
  });
  res.headers.set("Cache-Control", CACHE_CONTROL);
  return res;
}
