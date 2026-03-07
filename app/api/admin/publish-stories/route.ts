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

    const { published } = await publishStories({ categorySlug });

    return NextResponse.json({
      published,
      message: `${published} story/stories published and live.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Publish failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
