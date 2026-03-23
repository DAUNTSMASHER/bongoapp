/**
 * List .mp4 files in public/Videos for adding to lib/localVideos.ts.
 * Run: npx tsx scripts/list-local-videos.ts
 */

import * as fs from "fs";
import * as path from "path";

const VIDEOS_DIR = path.join(process.cwd(), "public", "Videos");

function main() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    console.error("public/Videos folder not found.");
    process.exit(1);
  }
  const files = fs.readdirSync(VIDEOS_DIR).filter((f) => /\.mp4$/i.test(f)).sort();
  if (files.length === 0) {
    console.log("No .mp4 files in public/Videos");
    return;
  }
  console.log(`Found ${files.length} videos. Add to lib/localVideos.ts LOCAL_VIDEO_FILES:\n`);
  console.log("const LOCAL_VIDEO_FILES = [");
  files.forEach((f) => console.log(`  "${f}",`));
  console.log("];");
}

main();
