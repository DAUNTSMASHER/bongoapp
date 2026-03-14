/**
 * Admin API: publish draft stories.
 * POST { "categorySlug": "sera" } - publish all drafts in that category
 * POST {} - publish all drafts
 */

import { NextResponse } from "next/server";
import { publishStories } from "@/scripts/crawler/saveStoriesToFirestore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug.trim() || undefined : undefined;
    const minBodyLength = typeof body?.minBodyLength === "number" ? Math.max(0, body.minBodyLength) : 500; // default 500, no skip for short stories

    const { published, total, skippedShort } = await publishStories({ categorySlug, minBodyLength });

    let message = `${published} story/stories published and live.`;
    if (skippedShort > 0) message += ` (${skippedShort} skipped: body < ${minBodyLength} chars)`;
    return NextResponse.json({
      published,
      total,
      skippedShort,
      message,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Publish failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
