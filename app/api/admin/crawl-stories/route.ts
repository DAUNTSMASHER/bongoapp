/**
 * Admin API: crawl a URL for stories, extract full text, save as draft.
 * POST { "url": "...", "categorySlug": "sera", "count": 20, "batchSize": 10, "smart": true }
 * smart: use ML-style crawler (character extraction, erotic tags, storyId deduplication, category propagation)
 */

import { NextResponse } from "next/server";
import { crawlStories } from "@/scripts/crawler/crawlStories";
import { crawlBanglaChotiSmart } from "@/scripts/crawler/crawlBanglaChotiSmart";
import { saveStoriesToFirestore, saveSmartStoriesToFirestore } from "@/scripts/crawler/saveStoriesToFirestore";

export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug.trim() : "";
    const count = Math.min(Math.max(parseInt(String(body?.count || 20), 10) || 20, 1), 100);
    const batchSize = Math.min(Math.max(Number(body?.batchSize) || 10, 1), 20);
    const smart = Boolean(body?.smart);

    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    if (!categorySlug) return NextResponse.json({ error: "Missing categorySlug" }, { status: 400 });
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const isVercel = Boolean(process.env.VERCEL);
    if (smart && isVercel && !process.env.FIRECRAWL_API_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "Story crawl on Vercel requires FIRECRAWL_API_KEY. Add it in Vercel Project Settings → Environment Variables. Or run locally: npm run crawl:stories [url] [categorySlug] [count]",
        },
        { status: 503 }
      );
    }

    if (smart) {
      const stories = await crawlBanglaChotiSmart(url, count, categorySlug, {
        usePlaywright: !isVercel,
        useFirecrawl: isVercel || Boolean(process.env.FIRECRAWL_API_KEY),
        qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
      });
      const createVariantsOnDuplicate = body?.createVariantsOnDuplicate !== false;
      const { inserted, skipped } = await saveSmartStoriesToFirestore(stories, categorySlug, {
        createVariantsOnDuplicate,
      });
      return NextResponse.json({
        extracted: stories.length,
        inserted,
        skipped,
        message: `${stories.length} stories extracted, ${inserted} saved, ${skipped} skipped (duplicates). Click Publish to make them live.`,
      });
    }

    const stories = await crawlStories(url, count, { batchSize });
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
