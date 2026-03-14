/**
 * Analytics track API — records page views and events to Firestore.
 * POST { type: "pageview" | "click", path?: string, event?: string }
 * Public endpoint (any visitor). Uses Firestore Admin SDK server-side.
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body?.type === "pageview" ? "pageview" : body?.type === "click" ? "click" : null;
    if (!type) {
      return NextResponse.json({ ok: false, error: "Invalid type" }, { status: 400 });
    }

    const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "";
    const event = typeof body?.event === "string" ? body.event.slice(0, 100) : "";

    const date = new Date();
    const tz = process.env.TZ || "Asia/Dhaka";
    const dateStr = date.toLocaleDateString("en-CA", { timeZone: tz });

    const firestore = initFirestore();
    const docRef = firestore.collection("analytics").doc("daily").collection("byDate").doc(dateStr);

    const updates: Record<string, ReturnType<typeof FieldValue.increment>> = {
      pageViews: FieldValue.increment(type === "pageview" ? 1 : 0),
      clicks: FieldValue.increment(type === "click" ? 1 : 0),
    };

    await docRef.set(updates, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Track failed" }, { status: 500 });
  }
}
