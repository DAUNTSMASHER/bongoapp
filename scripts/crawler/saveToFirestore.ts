/**
 * Saves VideoLink[] to Firestore collection "videos".
 * Deduplicates by src (no duplicate inserts).
 *
 * Firestore init uses service account (Node Admin SDK).
 * Plug in your own credentials via GOOGLE_APPLICATION_CREDENTIALS or serviceAccountPath.
 */

import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
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

let db: Firestore | null = null;

/**
 * Initialize Firestore with service account.
 * - FIREBASE_SERVICE_ACCOUNT: JSON string (for Vercel/serverless)
 * - GOOGLE_APPLICATION_CREDENTIALS: path to JSON file
 * - Pass serviceAccountPath (path to JSON file), or
 * - Pass an object matching ServiceAccount
 */
export function initFirestore(
  serviceAccountPathOrObject?: string | ServiceAccount
): Firestore {
  if (db) return db;
  if (getApps().length > 0) {
    db = getFirestore();
    return db;
  }
  try {
    let credential;
    if (typeof serviceAccountPathOrObject === "object") {
      credential = cert(serviceAccountPathOrObject);
    } else if (serviceAccountPathOrObject) {
      credential = cert(serviceAccountPathOrObject);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount);
    } else {
      credential = cert(
        process.env.GOOGLE_APPLICATION_CREDENTIALS || "./service-account.json"
      );
    }
    initializeApp({ credential });
  } catch (err) {
    if (getApps().length === 0) throw err;
    // App was created by parallel call; reuse
  }
  db = getFirestore();
  return db;
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
