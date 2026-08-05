/**
 * Admin API: GET/PUT Hot Chobi config.
 * GET: returns current items
 * PUT: { items: [{ src, headline }] } — saves to Firestore config/hotChobi
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { HOT_CHOBI_ITEMS } from "@/lib/hotChobiData";

function sanitizeItem(item: unknown): { src: string; headline: string } | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const src = typeof o.src === "string" ? o.src.trim() : "";
  const headline = typeof o.headline === "string" ? o.headline.trim() : "";
  if (!src) return null;
  return { src, headline: headline || "—" };
}

export async function GET() {
  try {
    const firestore = initFirestore();
    const doc = await firestore.collection("config").doc("hotChobi").get();
    if (doc.exists) {
      const data = doc.data();
      const items = Array.isArray(data?.items) ? data.items : [];
      return NextResponse.json({ items: items.length > 0 ? items : HOT_CHOBI_ITEMS });
    }
    return NextResponse.json({ items: HOT_CHOBI_ITEMS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load";
    return NextResponse.json({ error: msg, items: HOT_CHOBI_ITEMS }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = Array.isArray(body.items) ? body.items : [];
    const items = raw.map(sanitizeItem).filter((x: { src: string; headline: string } | null): x is { src: string; headline: string } => x !== null);
    if (items.length === 0) {
      return NextResponse.json({ error: "At least one item (src, headline) required" }, { status: 400 });
    }
    const firestore = initFirestore();
    await firestore.collection("config").doc("hotChobi").set({ items, updatedAt: new Date() });
    return NextResponse.json({ success: true, message: `Saved ${items.length} Hot Chobi items` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
