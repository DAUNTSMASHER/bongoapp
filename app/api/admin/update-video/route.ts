/**
 * Admin API: update a video by ID.
 * PUT { "id": "...", "title"?: "...", "thumbnailUrl"?: "...", ... }
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const firestore = initFirestore();
    const ref = firestore.collection("videos").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.thumbnailUrl === "string") updates.thumbnailUrl = body.thumbnailUrl.trim();
    if (typeof body.outboundUrl === "string") updates.outboundUrl = body.outboundUrl.trim();
    if (typeof body.embedUrl === "string") updates.embedUrl = body.embedUrl.trim() || null;
    if (typeof body.directVideoUrl === "string") updates.directVideoUrl = body.directVideoUrl.trim() || null;
    if (Array.isArray(body.tags)) updates.tags = body.tags;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await ref.update(updates);
    return NextResponse.json({ success: true, message: "Video updated" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
