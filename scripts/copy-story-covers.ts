/**
 * Copy and rename story cover images to public/story_cover/
 * Output names: bongochoti_online_golpo_01.png, bongochoti_online_golpo_02.png, ...
 *
 * Usage:
 *   npx tsx scripts/copy-story-covers.ts [sourceDir]
 *
 * If no sourceDir given, uses: C:\Users\user\.cursor\projects\c-Users-user-story-reading-app\assets
 * (or process.cwd()/../.cursor/projects/... on other machines)
 */

import * as fs from "fs";
import * as path from "path";

const IMAGE_EXTS = [".png", ".webp", ".jpg", ".jpeg"];
const OUT_DIR = path.join(process.cwd(), "public", "story_cover");
const OUT_PREFIX = "bongochoti_online_golpo_";

function getDefaultSourceDir(): string {
  // Try Cursor assets path (Windows)
  const cursorAssets = path.join(
    process.env.USERPROFILE || process.env.HOME || "",
    ".cursor",
    "projects",
    "c-Users-user-story-reading-app",
    "assets"
  );
  if (fs.existsSync(cursorAssets)) return cursorAssets;
  // Fallback: story-covers/ladies if exists
  const ladies = path.join(process.cwd(), "public", "story-covers", "ladies");
  if (fs.existsSync(ladies)) return ladies;
  return path.join(process.cwd(), "public", "story-covers");
}

async function main() {
  const sourceDir = process.argv[2] || getDefaultSourceDir();
  if (!fs.existsSync(sourceDir)) {
    console.error("Source directory not found:", sourceDir);
    console.log("Usage: npx tsx scripts/copy-story-covers.ts [sourceDir]");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(sourceDir)
    .filter((f) => IMAGE_EXTS.some((e) => f.toLowerCase().endsWith(e)))
    .sort();

  if (files.length === 0) {
    console.log("No images found in", sourceDir);
    process.exit(1);
  }

  let i = 1;
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const destName = `${OUT_PREFIX}${String(i).padStart(2, "0")}${ext}`;
    const srcPath = path.join(sourceDir, f);
    const destPath = path.join(OUT_DIR, destName);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${f} -> ${destName}`);
    i++;
  }

  console.log(`\nDone. ${files.length} images copied to public/story_cover/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
