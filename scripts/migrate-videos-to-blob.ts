/**
 * Migrate existing videos to Vercel Blob so they play on your site (no redirect).
 * Fetches videos that have directVideoUrl, uploads to Blob, updates Firestore.
 *
 * Prerequisites:
 * 1. Create a Blob store in Vercel Dashboard → Storage → Create Blob store (Public)
 * 2. Run: vercel env pull  (to get BLOB_READ_WRITE_TOKEN locally)
 * 3. Ensure FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS is set
 *
 * Run: npx tsx scripts/migrate-videos-to-blob.ts [--limit N] [--dry-run]
 *      npx tsx scripts/migrate-videos-to-blob.ts --from-file videos.json
 *
 * --from-file: Use when Firestore READ quota is exceeded. No reads, only writes.
 *   Export first when quota resets: npm run export-videos
 *   Or create JSON manually: [{"id":"abc","directVideoUrl":"https://..."}]
 * --no-update: Upload to Blob only, skip Firestore update. Use when writes are also exhausted.
 *   Outputs id -> blobUrl; update Firestore manually when quota resets.
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";
import { FieldValue } from "firebase-admin/firestore";
import { put } from "@vercel/blob";
import { initFirestore } from "./crawler/saveToFirestore";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function isBlobUrl(url: string): boolean {
  return /blob\.vercel-storage\.com/i.test(url);
}

function getBlobToken(): string | null {
  return (
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.BONGOCHOTI_BLOB_READ_WRITE_TOKEN?.trim() ||
    null
  );
}

type VideoEntry = { id: string; directVideoUrl: string; title?: string };

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1] || "10", 10) : 9999;
  const dryRun = args.includes("--dry-run");
  const noUpdate = args.includes("--no-update");
  const fromFileIdx = args.indexOf("--from-file");
  const fromFile = fromFileIdx >= 0 ? args[fromFileIdx + 1] : null;

  const blobToken = getBlobToken();
  if (!blobToken) {
    console.error("Blob token not set. Check: npx tsx scripts/check-blob-connection.ts");
    console.error("  Set BLOB_READ_WRITE_TOKEN (or BONGOCHOTI_BLOB_READ_WRITE_TOKEN) and run: vercel env pull");
    process.exit(1);
  }

  let videos: VideoEntry[];

  if (fromFile) {
    // No Firestore reads — use JSON file (workaround when quota exceeded)
    const filePath = path.resolve(fromFile);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      console.error("");
      console.error("Create videos.json with this format:");
      console.error('  [{"id":"video-doc-id","directVideoUrl":"https://..."}]');
      console.error("");
      console.error("To get the data:");
      console.error("  1. Firebase Console → Firestore → videos → copy id + directVideoUrl from docs");
      console.error("  2. Or when quota resets: npm run export-videos");
      console.error("");
      console.error("See videos-export-sample.json for the exact format.");
      process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const arr = Array.isArray(raw) ? raw : [raw];
    videos = arr
      .filter(
        (v: unknown): v is VideoEntry =>
          v != null &&
          typeof (v as VideoEntry).id === "string" &&
          typeof (v as VideoEntry).directVideoUrl === "string" &&
          (v as VideoEntry).directVideoUrl.startsWith("http") &&
          !isBlobUrl((v as VideoEntry).directVideoUrl)
      )
      .slice(0, limit);
    console.log(`Loaded ${videos.length} videos from ${fromFile} (no Firestore reads)${dryRun ? " [DRY RUN]" : ""}`);
  } else {
    // Fetch from Firestore (uses reads)
    const firestore = initFirestore();
    const maxReads = Math.min(limit * 2, 50);
    const snap = await firestore
      .collection("videos")
      .where("status", "==", "active")
      .limit(maxReads)
      .get();

    videos = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>))
      .filter(
        (v): v is VideoEntry =>
          !!v.directVideoUrl &&
          typeof v.directVideoUrl === "string" &&
          v.directVideoUrl.startsWith("http") &&
          !isBlobUrl(v.directVideoUrl)
      )
      .slice(0, limit);

    console.log(`Found ${videos.length} videos to migrate (max Firestore reads: ${maxReads})${dryRun ? " [DRY RUN]" : ""}`);
    if (videos.length === 0 && !dryRun) {
      console.log("Tip: If you hit 'Quota exceeded', use --from-file videos.json (see script header).");
    }
  }

  if (videos.length === 0) {
    console.log("No videos need migration. All directVideoUrl may already be Blob URLs.");
    return;
  }

  const firestore = noUpdate ? null : initFirestore();
  const updates: { id: string; directVideoUrl: string }[] = [];

  let migrated = 0;
  let failed = 0;

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const sourceUrl = v.directVideoUrl;
    const ext = sourceUrl.includes(".m3u8") ? "m3u8" : sourceUrl.match(/\.(mp4|webm|m3u8)/i)?.[1] || "mp4";

    const title = typeof v.title === "string" ? v.title.slice(0, 30) : "?";
    process.stdout.write(`[${i + 1}/${videos.length}] ${v.id} (${title}...) `);

    if (dryRun) {
      console.log("(dry-run, skipped)");
      migrated++;
      continue;
    }

    try {
      const sourceOrigin = new URL(sourceUrl).origin;
      const res = await fetch(sourceUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Referer: `${sourceOrigin}/`,
          Accept: "*/*",
        },
        redirect: "follow",
      });

      if (!res.ok || !res.body) {
        throw new Error(`Fetch failed: ${res.status}`);
      }

      const pathname = `videos/${v.id}.${ext}`;
      const { url: blobUrl } = await put(pathname, res.body as unknown as Blob, {
        access: "public",
        contentType: res.headers.get("content-type") || `video/${ext}`,
        addRandomSuffix: false,
        allowOverwrite: true,
        multipart: true,
        token: blobToken,
      });

      if (firestore) {
        await firestore.collection("videos").doc(String(v.id)).update({
          directVideoUrl: blobUrl,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        updates.push({ id: v.id, directVideoUrl: blobUrl });
      }

      console.log(`✓ → ${blobUrl.slice(0, 50)}...`);
      migrated++;
    } catch (err) {
      console.log(`✗ ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone. Migrated: ${migrated}, Failed: ${failed}`);

  if (noUpdate && updates.length > 0) {
    const outPath = "blob-updates-pending.json";
    fs.writeFileSync(outPath, JSON.stringify(updates, null, 2), "utf-8");
    console.log(`\nFirestore updates skipped (--no-update). Saved ${updates.length} to ${outPath}`);
    console.log("When quota resets: npx tsx scripts/apply-blob-updates.ts");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
