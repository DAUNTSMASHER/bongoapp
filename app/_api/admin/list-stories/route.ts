/**
 * Admin API: list stories by category (all statuses) for dropdown selection.
 * GET ?categorySlug=xxx&limit=200
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug") || "";
    const limitCount = Math.min(parseInt(searchParams.get("limit") || "200", 10) || 200, 500);

    const firestore = initFirestore();
    const col = firestore.collection("stories");
    const snap = categorySlug
      ? await col.where("categorySlug", "==", categorySlug).limit(limitCount).get()
      : await col.limit(limitCount).get();
    const stories = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || "Untitled",
        headline: d.headline || d.title || "",
      };
    });

    // Sort by title for dropdown
    stories.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    return NextResponse.json({ stories });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list stories";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
