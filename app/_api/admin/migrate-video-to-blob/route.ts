/**
 * Admin API: Migrate a single video to Vercel Blob.
 * POST { videoId: string }
 * Migrates the video's directVideoUrl to Blob storage so it plays on your site.
 */

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { put } from "@vercel/blob";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function isBlobUrl(url: string): boolean {
  return /blob\.vercel-storage\.com/i.test(url);
}

export async function POST(req: Request) {
  try {
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BONGOCHOTI_BLOB_READ_WRITE_TOKEN?.trim();
    if (!blobToken) {
      return NextResponse.json(
        { error: "Blob token not set. Add BLOB_READ_WRITE_TOKEN in Vercel env vars." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    const firestore = initFirestore();
    const doc = await firestore.collection("videos").doc(videoId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const d = doc.data()!;
    const sourceUrl = d.directVideoUrl;
    if (!sourceUrl || typeof sourceUrl !== "string" || !sourceUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "Video has no directVideoUrl to migrate" },
        { status: 400 }
      );
    }
    if (isBlobUrl(sourceUrl)) {
      return NextResponse.json({ success: true, url: sourceUrl, message: "Already on Blob" });
    }

    const sourceOrigin = new URL(sourceUrl).origin;
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: `${sourceOrigin}/`,
        Accept: "*/*",
      },
      redirect: "follow",
    });

    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: `Source returned ${res.status}` },
        { status: 502 }
      );
    }

    const ext = sourceUrl.includes(".m3u8") ? "m3u8" : sourceUrl.match(/\.(mp4|webm|m3u8)/i)?.[1] || "mp4";
    const pathname = `videos/${videoId}.${ext}`;

    const { url: blobUrl } = await put(pathname, res.body as unknown as Blob, {
      access: "public",
      contentType: res.headers.get("content-type") || `video/${ext}`,
      addRandomSuffix: false,
      allowOverwrite: true,
      multipart: true,
      token: blobToken,
    });

    await firestore.collection("videos").doc(videoId).update({
      directVideoUrl: blobUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, url: blobUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
