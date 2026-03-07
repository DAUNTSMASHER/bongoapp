/**
 * Saves CrawledVideo[] to Firestore collection "videos".
 * Uses document ID = video.id, deduplicates by id.
 */

import { FieldValue } from "firebase-admin/firestore";
import type { CrawledVideo } from "./crawlBanglaChotiVideos";
import { initFirestore } from "./saveToFirestore";

export async function saveCrawledVideosToFirestore(
  videos: CrawledVideo[],
  options?: { serviceAccountPath?: string }
): Promise<{ inserted: number; skipped: number }> {
  const firestore = initFirestore(options?.serviceAccountPath);
  const col = firestore.collection("videos");
  let inserted = 0;
  let skipped = 0;

  for (const v of videos) {
    // Require at least outboundUrl (landing page). directVideoUrl/embedUrl optional for link-out.
    if (!v.id || !v.outboundUrl) continue;

    const docRef = col.doc(v.id);
    const existing = await docRef.get();
    if (existing.exists) {
      skipped++;
      continue;
    }

    await docRef.set({
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
      createdAt: FieldValue.serverTimestamp(),
    });
    inserted++;
  }

  return { inserted, skipped };
}
