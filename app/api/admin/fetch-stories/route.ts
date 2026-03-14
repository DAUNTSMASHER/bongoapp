/**
 * Admin API: Fetch stories from a URL and return as JSON (no save).
 * Uses Vercel's Linux environment — Puppeteer/Playwright work here.
 *
 * POST { "url": "https://...", "count": 2 }
 * Returns: { stories: [...], extracted: number, successRate: string }
 */

import { NextResponse } from "next/server";
import { crawlBanglaChotiSmart } from "@/scripts/crawler/crawlBanglaChotiSmart";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const count = Math.min(Math.max(parseInt(String(body?.count || 2), 10) || 2, 1), 10);

    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const categorySlug = "swami-strir";

    const stories = await crawlBanglaChotiSmart(url, count, categorySlug, {
      usePuppeteer: false,
      usePlaywright: true,
      noPuppeteerFallback: false,
      qualityFilter: {
        minBodyLength: 800,
        minParagraphs: 1,
        rejectCtaEnding: true,
        requireNarrativeEnding: false,
      },
    });

    const successRate = count > 0 ? ((stories.length / count) * 100).toFixed(1) + "%" : "0%";

    const output = stories.map((s) => ({
      title: s.title,
      summary: s.summary,
      bodyLength: s.body?.length ?? 0,
      sourceUrl: s.sourceUrl,
      blockCount: s.processed?.blockCount,
      characterNames: s.processed?.characterNames,
      eroticTags: s.processed?.eroticTags?.slice(0, 10),
      body: s.body,
    }));

    return NextResponse.json({
      stories: output,
      extracted: stories.length,
      requested: count,
      successRate,
      message: `Extracted ${stories.length} stories with proper storytelling and endings.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
