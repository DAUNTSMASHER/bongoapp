/**
 * GET /api/stories/[id]
 * Returns one published story by Firestore document ID.
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const firestore = initFirestore();
    const doc = await firestore.collection("stories").doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = doc.data()!;
    if (data.status !== "published") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let story = toStory(doc);
    const mappingsDoc = await firestore.collection("config").doc("nameMappings").get();
    const mappings: NameMappings = (mappingsDoc.exists && mappingsDoc.data()?.mappings) || {};
    if (mappings && Object.keys(mappings).length > 0) {
      story = applyNameReplacementsToStory(story, mappings);
    }
    const res = NextResponse.json({ story });
    res.headers.set("Cache-Control", CACHE_CONTROL);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch story";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
