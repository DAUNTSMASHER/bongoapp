/**
 * Search web for videos by query. Uses Serper API.
 * POST { "query": "...", "maxVideos": 20, "batchSize": 5 }
 * batchSize: max organic URLs to crawl per run (reduces pressure). Videos from Serper /videos are not crawled.
 */

import { NextResponse } from "next/server";
import { searchAndExtractVideos } from "@/lib/searchVideos";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const maxVideos = Math.min(Math.max(Number(body?.maxVideos) || 20, 5), 30);

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const batchSize = Math.min(Math.max(Number(body?.batchSize) || 10, 5), 15);
    const videos = await searchAndExtractVideos(query, maxVideos, { maxOrganicCrawl: batchSize });

    return NextResponse.json({
      videos,
      count: videos.length,
      message: `${videos.length} ভিডিও পাওয়া গেছে। পাবলিশ করতে ক্লিক করুন।`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
