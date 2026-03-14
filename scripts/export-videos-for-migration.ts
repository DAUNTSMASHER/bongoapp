/**
 * Export videos (id + directVideoUrl) to JSON for --from-file migration.
 * Run when Firestore quota has reset. Then use: npm run migrate-videos -- --from-file videos-export.json
 *
 * Run: npx tsx scripts/export-videos-for-migration.ts [--limit N] [--out file.json]
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";
import { initFirestore } from "./crawler/saveToFirestore";

function isBlobUrl(url: string): boolean {
  return /blob\.vercel-storage\.com/i.test(url);
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1] || "500", 10) : 500;
  const outIdx = args.indexOf("--out");
  const outPath = outIdx >= 0 ? args[outIdx + 1] : "videos-export.json";

  const firestore = initFirestore();
  const snap = await firestore
    .collection("videos")
    .where("status", "==", "active")
    .limit(limit)
    .get();

  const videos = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>))
    .filter(
      (v): v is { id: string; directVideoUrl: string } =>
        !!v.directVideoUrl &&
        typeof v.directVideoUrl === "string" &&
        v.directVideoUrl.startsWith("http") &&
        !isBlobUrl(v.directVideoUrl)
    )
    .map((v) => ({ id: v.id, directVideoUrl: v.directVideoUrl }));

  const filePath = path.resolve(outPath);
  fs.writeFileSync(filePath, JSON.stringify(videos, null, 2), "utf-8");
  console.log(`Exported ${videos.length} videos to ${filePath}`);
  console.log(`Run: npm run migrate-videos -- --from-file ${path.basename(filePath)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
