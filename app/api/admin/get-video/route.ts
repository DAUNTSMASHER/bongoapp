/**
 * Admin API: get a video by ID (for editing).
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
    const doc = await firestore.collection("videos").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const d = doc.data()!;
    const video = {
      id: doc.id,
      title: d.title || "",
      thumbnailUrl: d.thumbnailUrl || "",
      outboundUrl: d.outboundUrl || "",
      embedUrl: d.embedUrl || "",
      directVideoUrl: d.directVideoUrl || "",
      tags: Array.isArray(d.tags) ? d.tags : [],
    };
    return NextResponse.json({ video });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch video";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
