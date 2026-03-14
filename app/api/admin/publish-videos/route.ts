/**
 * Publish search-extracted videos to Firestore.
 * POST { "videos": SearchVideo[], "batchSize"?: 5 }
 * Processes in batches to reduce pressure.
 */

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "@/scripts/crawler/saveToFirestore";
import type { SearchVideo } from "@/lib/searchVideos";

export const maxDuration = 60;

const DEFAULT_BATCH_SIZE = 5;
const BATCH_DELAY_MS = 200;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const videos = Array.isArray(body?.videos) ? body.videos : [];
    const batchSize = Math.min(Math.max(Number(body?.batchSize) || DEFAULT_BATCH_SIZE, 1), 20);
    const forceUpsert = body?.forceUpsert !== false; // default: upsert, no skip

    if (videos.length === 0) {
      return NextResponse.json({ error: "No videos to publish" }, { status: 400 });
    }

    const firestore = initFirestore();
    const col = firestore.collection("videos");
    let inserted = 0;
    let skipped = 0;
    let updated = 0;
    const valid = (videos as SearchVideo[]).filter(
      (v) => v?.id && (v.directVideoUrl || v.embedUrl)
    );

    for (let i = 0; i < valid.length; i += batchSize) {
      const batch = valid.slice(i, i + batchSize);
      for (const v of batch) {
        const docRef = col.doc(v.id);
        const existing = await docRef.get();
        const data = {
          id: v.id,
          title: v.title || "Video",
          thumbnailUrl: v.thumbnailUrl || "",
          outboundUrl: v.outboundUrl,
          embedUrl: v.embedUrl || null,
          directVideoUrl: v.directVideoUrl || null,
          tags: v.tags || [],
          language: "bn",
          sourceSite: v.sourceSite || "web-search",
          status: "active",
          updatedAt: FieldValue.serverTimestamp(),
        };
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
      if (i + batchSize < valid.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    let message = `${inserted} ভিডিও সেভ হয়েছে।`;
    if (updated > 0) message += ` ${updated} আপডেট হয়েছে।`;
    if (skipped > 0) message += ` ${skipped} স্কিপ।`;
    return NextResponse.json({
      inserted,
      skipped,
      updated,
      message,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
