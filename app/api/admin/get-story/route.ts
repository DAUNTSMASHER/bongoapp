/**
 * Admin API: get a story by ID (any status, for editing).
 * POST { "id": "..." }
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const firestore = initFirestore();
    const doc = await firestore.collection("stories").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const d = doc.data()!;
    const story = {
      id: doc.id,
      title: d.title || "",
      slug: d.slug || "",
      body: d.body || "",
      summary: d.summary || "",
      headline: d.headline || "",
      categorySlug: d.categorySlug || "",
      tags: Array.isArray(d.tags) ? d.tags : [],
      status: d.status || "draft",
    };
    return NextResponse.json({ story });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch story";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
