/**
 * GET /api/hot-chobi
 * Returns Hot Chobi items (public). Uses Firestore config/hotChobi if exists, else fallback.
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { HOT_CHOBI_ITEMS } from "@/lib/hotChobiData";

export const revalidate = 60;
const CACHE = "public, s-maxage=60, stale-while-revalidate=120";

export async function GET() {
  try {
    const firestore = initFirestore();
    const doc = await firestore.collection("config").doc("hotChobi").get();
    if (doc.exists) {
      const data = doc.data();
      const items = Array.isArray(data?.items) ? data.items : [];
      if (items.length > 0) {
        const res = NextResponse.json({ items });
        res.headers.set("Cache-Control", CACHE);
        return res;
      }
    }
  } catch {
    // Fall through to static fallback
  }
  const items = HOT_CHOBI_ITEMS;
  const res = NextResponse.json({ items });
  res.headers.set("Cache-Control", CACHE);
  return res;
}
