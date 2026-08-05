/**
 * Admin API: list stories for management (select, delete, edit).
 * GET ?limit=100&categorySlug=&status=
 * Returns id, title, status, categorySlug. Works on Vercel.
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug") || "";
    const status = searchParams.get("status") || "";
    const limitCount = Math.min(parseInt(searchParams.get("limit") || "100", 10) || 100, 500);

    const firestore = initFirestore();
    const col = firestore.collection("stories");
    let snap;

    if (categorySlug) {
      snap = await col.where("categorySlug", "==", categorySlug).limit(limitCount * 2).get();
    } else if (status) {
      snap = await col.where("status", "==", status).limit(limitCount).get();
    } else {
      snap = await col.limit(limitCount).get();
    }

    let stories = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || "Untitled",
        headline: d.headline || d.title || "",
        status: d.status || "draft",
        categorySlug: d.categorySlug || "",
      };
    });

    if (categorySlug && status) {
      stories = stories.filter((s) => s.status === status).slice(0, limitCount);
    }

    return NextResponse.json({ stories, total: stories.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list stories";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
