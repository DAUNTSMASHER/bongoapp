/**
 * Admin API: create a new story (draft) with SEO metadata.
 * POST { title, body, categorySlug, coverImageUrl?, tags? }
 */

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { enhanceStorySync } from "@/lib/aiStoryEnhancer";

function slugify(s: string): string {
  const slug = s
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "story";
  return slug;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const storyBody = typeof body?.body === "string" ? body.body.trim() : "";
    const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug.trim() : "uncategorized";
    const coverImageUrl = typeof body?.coverImageUrl === "string" ? body.coverImageUrl.trim() : null;
    const tags = Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [];
    const status = body?.status === "draft" ? "draft" : "published";

    if (!title || !storyBody) {
      return NextResponse.json({ error: "title and body required" }, { status: 400 });
    }

    const enhanced = enhanceStorySync(title, storyBody);
    const summary = storyBody.slice(0, 150).trim() + (storyBody.length > 150 ? "…" : "");
    const lengthType = storyBody.length < 500 ? "short" : storyBody.length < 2000 ? "medium" : "long";

    const firestore = initFirestore();
    const col = firestore.collection("stories");
    const slug = slugify(title);
    const id = `${slug}-${Date.now().toString(36)}`;

    await col.doc(id).set({
      id,
      title,
      slug,
      headline: enhanced.headline,
      body: storyBody,
      summary,
      seoTitle: enhanced.seoTitle,
      seoDescription: enhanced.seoDescription,
      hashtags: enhanced.hashtags,
      parts: enhanced.parts,
      coverImageUrl: coverImageUrl || null,
      tags,
      categorySlug: categorySlug || "uncategorized",
      language: "bn",
      lengthType,
      status,
      publishedAt: status === "published" ? FieldValue.serverTimestamp() : null,
      popularityScore: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id, message: status === "published" ? "Story created and live" : "Story created as draft" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
