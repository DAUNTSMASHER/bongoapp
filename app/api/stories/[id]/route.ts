/**
 * GET /api/stories/[id]
 * Returns one published story by Firestore document ID.
 */

import { NextResponse } from "next/server";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
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

    const story = toStory(doc);
    return NextResponse.json({ story });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch story";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
