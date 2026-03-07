/**
 * Admin API: crawl a URL for stories, extract full text, save as draft.
 * POST { "url": "...", "categorySlug": "sera", "count": 40 }
 */

import { NextResponse } from "next/server";
import { crawlStories } from "@/scripts/crawler/crawlStories";
import { saveStoriesToFirestore } from "@/scripts/crawler/saveStoriesToFirestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug.trim() : "";
    const count = Math.min(Math.max(parseInt(String(body?.count || 10), 10) || 10, 1), 100);

    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    if (!categorySlug) return NextResponse.json({ error: "Missing categorySlug" }, { status: 400 });
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const stories = await crawlStories(url, count);
    const { inserted } = await saveStoriesToFirestore(stories, categorySlug);

    return NextResponse.json({
      extracted: stories.length,
      inserted,
      message: `${stories.length} stories extracted, ${inserted} saved as draft under category "${categorySlug}". Click Publish to make them live.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
