/**
 * Apply pending Blob URL updates to Firestore (from --no-update run).
 * Run when Firestore quota has reset.
 *
 * Run: npx tsx scripts/apply-blob-updates.ts [blob-updates-pending.json]
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";
import { FieldValue } from "firebase-admin/firestore";
import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  const filePath = process.argv[2] || "blob-updates-pending.json";
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    console.error("");
    console.error("This file is created when you run: npm run migrate-videos -- --from-file <json> --no-update");
    console.error("That uploads videos to Blob and saves pending Firestore updates here.");
    process.exit(1);
  }
  const updates = JSON.parse(fs.readFileSync(abs, "utf-8")) as { id: string; directVideoUrl: string }[];
  if (!Array.isArray(updates) || updates.length === 0) {
    console.log("No updates to apply.");
    return;
  }

  const firestore = initFirestore();
  let applied = 0;
  for (const u of updates) {
    try {
      await firestore.collection("videos").doc(u.id).update({
        directVideoUrl: u.directVideoUrl,
        updatedAt: FieldValue.serverTimestamp(),
      });
      applied++;
      process.stdout.write(`.`);
    } catch (err) {
      console.error(`\nFailed ${u.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`\nApplied ${applied}/${updates.length} updates.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
