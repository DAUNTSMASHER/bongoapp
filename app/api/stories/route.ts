/**
 * GET /api/stories
 * Returns published stories from Firestore.
 * Query: ?category=slug &limit=50
 * Applies name replacements from config/nameMappings to headline/title.
 */

import { NextResponse } from "next/server";

export const revalidate = 60;
const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=120";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { applyNameReplacementsToStory, type NameMappings } from "@/lib/nameReplacement";
import type { Story } from "@/types/story";

function toStory(doc: DocumentSnapshot): Story {
  const d = doc.data()!;
  const createdAt = d.createdAt?.toDate?.() ?? new Date();
  const updatedAt = d.updatedAt?.toDate?.() ?? createdAt;
  const publishedAt = d.publishedAt?.toDate?.();
  return {
    id: doc.id,
    title: d.title || "Untitled",
    slug: d.slug || doc.id,
    body: d.body || "",
    summary: d.summary,
    coverImageUrl: d.coverImageUrl,
    tags: Array.isArray(d.tags) ? d.tags : [],
    categorySlug: d.categorySlug,
    language: d.language || "bn",
    lengthType: d.lengthType || "medium",
    sourceUrl: d.sourceUrl,
    status: d.status || "published",
    popularityScore: d.popularityScore ?? 0,
    createdAt,
    updatedAt,
    publishedAt,
    headline: d.headline,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    hashtags: Array.isArray(d.hashtags) ? d.hashtags : [],
    parts: Array.isArray(d.parts) ? d.parts : [],
    characterNames: Array.isArray(d.characterNames) ? d.characterNames : undefined,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const limitCount = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);

    const firestore = initFirestore();
    const snap = await firestore
      .collection("stories")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .limit(limitCount)
      .get();

    let stories: Story[] = snap.docs.map((doc) => toStory(doc));
    if (category) {
      stories = stories.filter((s) => s.categorySlug === category);
    }
    const mappingsDoc = await firestore.collection("config").doc("nameMappings").get();
    const mappings: NameMappings = (mappingsDoc.exists && mappingsDoc.data()?.mappings) || {};
    if (mappings && Object.keys(mappings).length > 0) {
      stories = stories.map((s) => applyNameReplacementsToStory(s, mappings));
    }

    const res = NextResponse.json({ stories });
    res.headers.set("Cache-Control", CACHE_CONTROL);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch stories";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
