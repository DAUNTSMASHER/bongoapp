/**
 * Saves VideoLink[] to Firestore collection "videos".
 * Deduplicates by src (no duplicate inserts).
 *
 * Firestore init uses service account (Node Admin SDK).
 * Plug in your own credentials via GOOGLE_APPLICATION_CREDENTIALS or serviceAccountPath.
 */

import { getFirebaseAdmin, getDb } from "@/lib/firebaseAdmin";
import {
  getFirestore,
  FieldValue,
  type Firestore,
  type FieldValue as FieldValueType,
} from "firebase-admin/firestore";
import type { VideoLink } from "./crawlVideoLinks";

export interface StoredVideo {
  src: string;
  type: string;
  sourceUrl: string;
  createdAt: FieldValueType;
}

/**
 * Initialize Firestore using the centralized Firebase Admin logic.
 */
export function initFirestore(_ignored?: any): Firestore {
  return getDb();
}

/**
 * Saves video links to Firestore collection "videos".
 * If a document with the same src already exists, it is skipped (no duplicate).
 * Returns counts of inserted and skipped.
 */
export async function saveVideoLinksToFirestore(
  links: VideoLink[],
  options?: { serviceAccountPath?: string }
): Promise<{ inserted: number; skipped: number }> {
  const firestore = initFirestore(options?.serviceAccountPath);
  const col = firestore.collection("videos");
  let inserted = 0;
  let skipped = 0;

  for (const link of links) {
    const src = link.src?.trim();
    if (!src) continue;

    const snapshot = await col.where("src", "==", src).limit(1).get();
    if (!snapshot.empty) {
      skipped++;
      continue;
    }

    const doc: StoredVideo = {
      src,
      type: link.type,
      sourceUrl: link.sourceUrl,
      createdAt: FieldValue.serverTimestamp(),
    };
    await col.add(doc);
    inserted++;
  }

  return { inserted, skipped };
}
