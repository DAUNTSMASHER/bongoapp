/**
 * Fetch video direct URLs from external pages and write videos.json (no Firestore).
 * Use when Firestore quota is exceeded. IDs match bck-<slug> convention.
 *
 * Run: npx tsx scripts/fetch-videos-json-from-urls.ts [url1] [url2] ...
 * Or:  npx tsx scripts/fetch-videos-json-from-urls.ts   (uses default URL list)
 */

import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import * as fs from "fs";
import * as path from "path";
import { extractFromUrls } from "./extractVideoUrls";

const DEFAULT_URLS = [
  "https://www.banglachotikahinii.com/videos/dhaka-muslim-bone-gude-angul-nogno-mms/",
  "https://www.banglachotikahinii.com/videos/bangladeshi-gramer-bon-bhai-nagno-chudai/",
  "https://www.banglachotikahinii.com/videos/bangla-bhai-boro-bon-chodachudi-mms/",
  "https://www.banglachotikahinii.com/videos/sofik-sk-mms-viral-sex-bangali-couple/",
  "https://www.banglachotikahinii.com/videos/bangladeshi-boro-boobs-bhabhir-chudachudi/",
];

function slugFromUrl(url: string): string {
  const p = url.replace(/\/$/, "").split("/").pop() || "v";
  return `bck-${p.replace(/[^a-z0-9-]/gi, "-").slice(0, 60)}`;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a.startsWith("http"));
  const urls = args.length > 0 ? args : DEFAULT_URLS;
  if (urls.length === 0) {
    console.error("No URLs. Pass video page URLs or script uses defaults.");
    process.exit(1);
  }

  console.log(`Fetching ${urls.length} pages (no Firestore)...\n`);
  const results = await extractFromUrls(urls);
  const videos = results
    .filter((r) => r.directUrl)
    .map((r) => ({ id: slugFromUrl(r.pageUrl), directVideoUrl: r.directUrl! }));

  const outPath = path.resolve("videos.json");
  fs.writeFileSync(outPath, JSON.stringify(videos, null, 2), "utf-8");
  console.log(`\nWrote ${videos.length} videos to ${outPath}`);
  console.log(`Run: npm run migrate-videos -- --from-file videos.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
