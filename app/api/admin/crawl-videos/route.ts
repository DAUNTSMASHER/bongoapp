/**
 * Admin API: crawl BanglaChotiKahinii URL, extract videos (direct mp4/embed), save to Firestore.
 * POST { "url": "...", "maxVideos": 10, "batchSize": 5 }
 * batchSize: process this many per run to reduce pressure (default 10).
 * Returns { extracted, inserted, skipped, message }
 */

import { NextResponse } from "next/server";

export const maxDuration = 300; // 100 videos with Puppeteer can take several minutes
import { crawlBanglaChotiListing } from "@/scripts/crawler/crawlBanglaChotiVideos";
import { saveCrawledVideosToFirestore } from "@/scripts/crawler/saveCrawledVideos";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const maxVideos = Math.min(Math.max(Number(body?.maxVideos) || 100, 3), 100);
    const batchSize = Math.min(Math.max(Number(body?.batchSize) || 100, 3), 100);
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

    const limit = Math.min(maxVideos, batchSize);
    const usePuppeteer = body?.usePuppeteer !== false; // default true – site loads video URLs via JS
    const videos = await crawlBanglaChotiListing(url, { maxVideos: limit, usePuppeteer });
    const { inserted, skipped } = await saveCrawledVideosToFirestore(videos);

    let message = `${videos.length} ভিডিও পাওয়া গেছে। ${inserted} নতুন যোগ হয়েছে, ${skipped} আগে থেকেই ছিল।`;
    if (videos.length === 0) {
      message += " কিছু ভিডিও পেজ 404 বা ব্লক করেছে। পরে আবার চেষ্টা করুন।";
    } else {
      message += " ভিডিওগুলো এখন অ্যাপে দেখা যাবে।";
    }
    return NextResponse.json({
      extracted: videos.length,
      inserted,
      skipped,
      message,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
