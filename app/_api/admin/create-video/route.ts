/**
 * Admin API: create a new video.
 * POST { title, thumbnailUrl, outboundUrl, embedUrl?, directVideoUrl?, tags? }
 */

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "video";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const thumbnailUrl = typeof body?.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
    const outboundUrl = typeof body?.outboundUrl === "string" ? body.outboundUrl.trim() : "";
    const embedUrl = typeof body?.embedUrl === "string" ? body.embedUrl.trim() : null;
    const directVideoUrl = typeof body?.directVideoUrl === "string" ? body.directVideoUrl.trim() : null;
    const tags = Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [];

    if (!title || !outboundUrl) {
      return NextResponse.json({ error: "title and outboundUrl required" }, { status: 400 });
    }

    const firestore = initFirestore();
    const col = firestore.collection("videos");
    const slug = slugify(title);
    const id = `${slug}-${Date.now().toString(36)}`;

    await col.doc(id).set({
      id,
      title,
      thumbnailUrl: thumbnailUrl || outboundUrl,
      outboundUrl,
      embedUrl: embedUrl || null,
      directVideoUrl: directVideoUrl || null,
      tags,
      language: "bn",
      sourceSite: "manual",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id, message: "Video created" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
