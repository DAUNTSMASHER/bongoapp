#!/usr/bin/env npx tsx
/**
 * Fetches a story URL and prints headline + body to terminal.
 * Usage: npx tsx scripts/extract-one-story.ts <url>
 */

import { extractStoryFromUrl } from "./crawler/crawlStories";

const url =
  process.argv[2] ||
  "https://www.banglachotikahinii.com/bangla-illicit-sex-story/rimar-hariye-jaoa-bangla-sex-golpo-1/";

async function main() {
  console.log("Fetching:", url);
  console.log("");

  let story;
  try {
    story = await extractStoryFromUrl(url);
  } catch (e) {
    console.error("Fetch failed, retrying with Puppeteer...");
    story = await extractStoryFromUrl(url, { usePuppeteer: true });
  }

  if (!story) {
    console.error("Could not extract story from page.");
    process.exit(1);
  }

  console.log("═".repeat(70));
  console.log("  HEADLINE / TITLE");
  console.log("═".repeat(70));
  console.log(story.title);
  console.log("");
  console.log("═".repeat(70));
  console.log("  STORY BODY");
  console.log("═".repeat(70));
  console.log(story.body);
  console.log("");
  console.log("═".repeat(70));
  console.log(`  Summary: ${story.body.length} chars`);
  console.log("═".repeat(70));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
