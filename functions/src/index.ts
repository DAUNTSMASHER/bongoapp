/**
 * Firebase Cloud Functions - crawl BanglaChoti videos and save to Firestore.
 * Called from Admin Dashboard button. No manual CLI needed.
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { crawlBanglaChotiListing } from "./crawler.js";
import type { CrawledVideo } from "./crawler.js";

initializeApp();

const DEFAULT_URL = "https://www.banglachotikahinii.com/videos/";
const INITIAL_ADMIN_EMAIL = "jobayertashdid920@gmail.com";

async function getAdminEmails(): Promise<string[]> {
  const snap = await getFirestore().doc("config/admins").get();
  return snap.exists ? snap.data()?.emails ?? [] : [];
}

function isAdmin(email: string | undefined, adminEmails: string[]): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === INITIAL_ADMIN_EMAIL || adminEmails.includes(normalized);
}

async function saveVideosToFirestore(videos: CrawledVideo[]): Promise<{ inserted: number; skipped: number }> {
  const col = getFirestore().collection("videos");
  let inserted = 0;
  let skipped = 0;

  for (const v of videos) {
    if (!v.id || (!v.directVideoUrl && !v.embedUrl)) continue;

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

export const crawlBanglaChotiVideos = onCall(
  { timeoutSeconds: 120, memory: "512MiB" },
  async (request) => {
    const email = request.auth?.token?.email as string | undefined;
    if (!email) {
      throw new HttpsError("unauthenticated", "Sign in required");
    }
    const adminEmails = await getAdminEmails();
    if (!isAdmin(email, adminEmails)) {
      throw new HttpsError("permission-denied", "Admin access required");
    }

    const url = (request.data?.url as string)?.trim() || DEFAULT_URL;
    const maxVideos = Math.min(Math.max(Number(request.data?.maxVideos) || 15, 5), 25);

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new HttpsError("invalid-argument", "Invalid URL");
    }

    const videos = await crawlBanglaChotiListing(url, { maxVideos });
    const { inserted, skipped } = await saveVideosToFirestore(videos);

    return {
      extracted: videos.length,
      inserted,
      skipped,
      message: `${videos.length} ভিডিও পাওয়া গেছে। ${inserted} নতুন যোগ হয়েছে, ${skipped} আগে থেকেই ছিল। ভিডিওগুলো এখন অ্যাপে দেখা যাবে।`,
    };
  }
);
