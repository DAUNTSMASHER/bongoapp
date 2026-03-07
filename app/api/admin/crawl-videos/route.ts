/**
 * Admin API: crawl BanglaChotiKahinii URL, extract videos (direct mp4/embed), save to Firestore.
 * POST { "url": "https://www.banglachotikahinii.com/videos/", "maxVideos": 15 }
 * Returns { extracted, inserted, skipped, message }
 * Works on Vercel serverless (no Blaze plan needed).
 */

import { NextResponse } from "next/server";

export const maxDuration = 60;
import { crawlBanglaChotiListing } from "@/scripts/crawler/crawlBanglaChotiVideos";
import { saveCrawledVideosToFirestore } from "@/scripts/crawler/saveCrawledVideos";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const maxVideos = Math.min(Math.max(Number(body?.maxVideos) || 15, 5), 25);
    if (!url) {
      return NextResponse.json(
        { error: "Missing or invalid url" },
        { status: 400 }
      );
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    const videos = await crawlBanglaChotiListing(url, { maxVideos });
    const { inserted, skipped } = await saveCrawledVideosToFirestore(videos);

    return NextResponse.json({
      extracted: videos.length,
      inserted,
      skipped,
      message: `${videos.length} ভিডিও পাওয়া গেছে। ${inserted} নতুন যোগ হয়েছে, ${skipped} আগে থেকেই ছিল। ভিডিওগুলো এখন অ্যাপে দেখা যাবে।`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
