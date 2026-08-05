/**
 * GET /api/name-mappings
 * Returns name replacement mappings from Firestore config/nameMappings.
 * Used by client to replace names in story headlines/titles.
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import type { NameMappings } from "@/lib/nameReplacement";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const firestore = initFirestore();
    const doc = await firestore.collection("config").doc("nameMappings").get();
    const mappings: NameMappings = (doc.exists && doc.data()?.mappings) || {};
    return NextResponse.json({ mappings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch name mappings";
    return NextResponse.json({ error: msg, mappings: {} }, { status: 500 });
  }
}
