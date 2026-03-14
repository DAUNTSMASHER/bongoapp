/**
 * Saves CrawledVideo[] to Firestore collection "videos".
 * Uses document ID = video.id.
 * forceUpsert: when true, update existing instead of skip (no duplicates skipped).
 */

import { FieldValue } from "firebase-admin/firestore";
import type { CrawledVideo } from "./crawlBanglaChotiVideos";
import { initFirestore } from "./saveToFirestore";

const VIDEO_DATA = (v: CrawledVideo) => ({
  id: v.id,
  title: v.title,
  thumbnailUrl: v.thumbnailUrl || "",
  outboundUrl: v.outboundUrl,
  embedUrl: v.embedUrl || null,
  directVideoUrl: v.directVideoUrl || null,
  tags: v.tags || [],
  language: "bn",
  sourceSite: v.sourceSite || "banglachotikahinii",
  status: "active",
  updatedAt: FieldValue.serverTimestamp(),
});

export async function saveCrawledVideosToFirestore(
  videos: CrawledVideo[],
  options?: { serviceAccountPath?: string; forceUpsert?: boolean }
): Promise<{ inserted: number; skipped: number; updated: number }> {
  const firestore = initFirestore(options?.serviceAccountPath);
  const col = firestore.collection("videos");
  const forceUpsert = options?.forceUpsert ?? true; // default: no skip, upsert
  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  for (const v of videos) {
    if (!v.id || !v.outboundUrl) continue;

    const docRef = col.doc(v.id);
    const existing = await docRef.get();
    const data = VIDEO_DATA(v);

    if (existing.exists) {
      if (forceUpsert) {
        await docRef.update(data);
        updated++;
      } else {
        skipped++;
      }
      continue;
    }

    await docRef.set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
    inserted++;
  }

  return { inserted, skipped, updated };
}
