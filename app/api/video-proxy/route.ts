/**
 * GET /api/video-proxy?id=xxx
 * Proxies video stream from source to avoid "Access denied" when opening link directly.
 * Uses our URL so copied links work.
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const firestore = initFirestore();
    const doc = await firestore.collection("videos").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const d = doc.data()!;
    const directUrl = d.directVideoUrl;
    if (!directUrl || typeof directUrl !== "string") {
      return NextResponse.json({ error: "No video URL" }, { status: 404 });
    }

    const sourceOrigin = new URL(directUrl).origin;
    const range = req.headers.get("range");

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Referer: `${sourceOrigin}/`,
      Accept: "*/*",
    };
    if (range) headers.Range = range;

    const res = await fetch(directUrl, {
      headers,
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Source returned ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "video/mp4";
    const contentLength = res.headers.get("content-length");
    const acceptRanges = res.headers.get("accept-ranges") || "bytes";

    const streamHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Accept-Ranges": acceptRanges,
      "Cache-Control": "public, max-age=3600",
    };
    if (contentLength) streamHeaders["Content-Length"] = contentLength;
    const resRange = res.headers.get("content-range");
    if (resRange) streamHeaders["Content-Range"] = resRange;

    return new NextResponse(res.body, {
      status: res.status,
      headers: streamHeaders,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Proxy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
