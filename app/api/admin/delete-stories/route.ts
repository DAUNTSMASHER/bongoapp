/**
 * Admin API: delete stories from Firestore.
 * POST { "deleteAll": true } | { "storyIds": ["id1","id2"] } | { "categorySlug": "bandhobi" }
 * Requires FIREBASE_SERVICE_ACCOUNT. Works on Vercel.
 */

import { NextResponse } from "next/server";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const deleteAll = Boolean(body?.deleteAll);
    const storyIds = Array.isArray(body?.storyIds) ? body.storyIds : [];
    const categorySlug = typeof body?.categorySlug === "string" ? body.categorySlug.trim() : "";

    const firestore = initFirestore();

    if (deleteAll) {
      const snap = await firestore.collection("stories").get();
      if (snap.empty) {
        return NextResponse.json({ deleted: 0, message: "No stories to delete." });
      }
      const batchSize = 500;
      let deleted = 0;
      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = firestore.batch();
        docs.slice(i, i + batchSize).forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += Math.min(batchSize, docs.length - i);
      }
      return NextResponse.json({ deleted, message: `Deleted ${deleted} stories.` });
    }

    if (storyIds.length > 0) {
      let deleted = 0;
      const batch = firestore.batch();
      for (const id of storyIds) {
        if (typeof id !== "string" || !id.trim()) continue;
        const ref = firestore.collection("stories").doc(id.trim());
        batch.delete(ref);
        deleted++;
      }
      if (deleted > 0) await batch.commit();
      return NextResponse.json({ deleted, message: `Deleted ${deleted} stories.` });
    }

    if (categorySlug) {
      const snap = await firestore
        .collection("stories")
        .where("categorySlug", "==", categorySlug)
        .get();
      if (snap.empty) {
        return NextResponse.json({ deleted: 0, message: `No stories in category "${categorySlug}".` });
      }
      const batch = firestore.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return NextResponse.json({ deleted: snap.size, message: `Deleted ${snap.size} stories in "${categorySlug}".` });
    }

    return NextResponse.json({ error: "Provide deleteAll, storyIds, or categorySlug" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
