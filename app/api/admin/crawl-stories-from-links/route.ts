/**
 * Admin API: crawl multiple story URLs (user pastes links).
 * POST { "urls": ["https://...", "https://..."], "categorySlug": "kajer-meye" }
 * Saves as draft. Use Publish to make live.
 */

import { NextResponse } from "next/server";
import { crawlStoriesFromUrls } from "@/scripts/crawler/crawlBanglaChotiSmart";
import { saveSmartStoriesToFirestore } from "@/scripts/crawler/saveStoriesToFirestore";

export const maxDuration = 180;

function parseUrls(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .filter((v) => typeof v === "string" && v.trim().startsWith("http"))
      .map((v) => (v as string).trim());
  }
  if (typeof input === "string") {
    return input
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));
  }
  return [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls = parseUrls(body?.urls);
    const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug.trim() : "";

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "Provide urls: paste links (one per line or comma-separated)" },
        { status: 400 }
      );
    }
    if (!categorySlug) {
      return NextResponse.json({ error: "Missing categorySlug" }, { status: 400 });
    }
    if (urls.length > 50) {
      return NextResponse.json(
        { error: "Max 50 URLs per request" },
        { status: 400 }
      );
    }

    const isVercel = Boolean(process.env.VERCEL);
    if (isVercel && !process.env.FIRECRAWL_API_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "Crawl on Vercel requires FIRECRAWL_API_KEY. Add it in Vercel Environment Variables.",
        },
        { status: 503 }
      );
    }

    const stories = await crawlStoriesFromUrls(urls, categorySlug, {
      useFirecrawl: isVercel || Boolean(process.env.FIRECRAWL_API_KEY),
      usePlaywright: !isVercel,
      preferredProviders: isVercel ? ["firecrawl", "browsercat", "fetch"] : undefined,
      qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
    });

    const createVariantsOnDuplicate = body?.createVariantsOnDuplicate !== false;
    const forceUpsert = body?.forceUpsert !== false; // default: upsert, no skip
    const { inserted, skipped, updated } = await saveSmartStoriesToFirestore(stories, categorySlug, {
      createVariantsOnDuplicate,
      forceUpsert,
      assignCoverImages: true,
    });

    let msg = `${stories.length} extracted. ${inserted} saved, ${updated ?? 0} updated.`;
    if (skipped > 0) msg += ` ${skipped} skipped.`;
    msg += " Click Publish to make them live.";

    return NextResponse.json({
      extracted: stories.length,
      inserted,
      skipped,
      updated: updated ?? 0,
      message: msg,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
