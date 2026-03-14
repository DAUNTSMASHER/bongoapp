/**
 * Admin API: update a story by ID.
 * PUT { "id": "...", "title"?: "...", "headline"?: "...", "body"?: "...", ... }
 */

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const firestore = initFirestore();
    const ref = firestore.collection("stories").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.headline === "string") updates.headline = body.headline.trim();
    if (typeof body.body === "string") updates.body = body.body.trim();
    if (typeof body.summary === "string") updates.summary = body.summary.trim();
    if (typeof body.slug === "string") updates.slug = body.slug.trim();
    if (typeof body.categorySlug === "string") updates.categorySlug = body.categorySlug.trim() || null;
    if (Array.isArray(body.tags)) updates.tags = body.tags;
    if (typeof body.seoTitle === "string") updates.seoTitle = body.seoTitle.trim();
    if (typeof body.seoDescription === "string") updates.seoDescription = body.seoDescription.trim();
    if (Array.isArray(body.characterNames)) updates.characterNames = body.characterNames;
    if (typeof body.coverImageUrl === "string") updates.coverImageUrl = body.coverImageUrl.trim() || null;
    if (body.status === "published" || body.status === "draft") {
      updates.status = body.status;
      if (body.status === "published") {
        updates.publishedAt = FieldValue.serverTimestamp();
      }
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await ref.update(updates);
    return NextResponse.json({ success: true, message: "Story updated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
