/**
 * Cover image helpers.
 * Uses public/story_cover/ with files named bongochoti_online_golpo_01.png, etc.
 * Add or replace images in that folder - they are picked up automatically for new stories.
 */

import * as fs from "fs";
import * as path from "path";

const STORY_COVER_DIR = path.join(process.cwd(), "public", "story_cover");
const IMAGE_EXTS = [".png", ".webp", ".jpg", ".jpeg"];

/**
 * Returns cover image URLs from public/story_cover/.
 * Accepts files named bongochoti_online_golpo_XX.ext or any image in the folder.
 * Add/replace images anytime - they are picked up automatically.
 */
export function getLadyCoverImages(): string[] {
  if (!fs.existsSync(STORY_COVER_DIR)) return [];

  const files = fs
    .readdirSync(STORY_COVER_DIR)
    .filter((f) => IMAGE_EXTS.some((ext) => f.toLowerCase().endsWith(ext)))
    .sort();

  return files.map((f) => `/story_cover/${f}`);
}
