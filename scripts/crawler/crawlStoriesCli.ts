/**
 * CLI: Crawl stories from a URL and save to Firestore (same as admin "Generate and add stories").
 *
 * Run:
 *   npm run crawl:stories
 *   npm run crawl:stories -- https://www.banglachotikahinii.com/
 *   npm run crawl:stories -- https://www.banglachotikahinii.com/ sera 20
 *   npm run crawl:stories -- https://www.banglachotikahinii.com/ seria 20 --publish
 *
 * Args: [url] [categorySlug] [count] [--publish]
 * --publish: also publish drafts so they show on site
 */

import { crawlStories } from "./crawlStories";
import { saveStoriesToFirestore, publishStories } from "./saveStoriesToFirestore";

const DEFAULT_URL = "https://www.banglachotikahinii.com/";
const DEFAULT_CATEGORY = "sera";
const DEFAULT_COUNT = 10;

async function main() {
  const rawArgs = process.argv.slice(2);
  const doPublish = rawArgs.includes("--publish");
  const args = rawArgs.filter((a) => a !== "--publish");

  const url = args[0] || process.env.CRAWL_STORY_URL || DEFAULT_URL;
  const categorySlug = args[1] || process.env.CRAWL_STORY_CATEGORY || DEFAULT_CATEGORY;
  const count = Math.min(
    Math.max(parseInt(args[2] || String(DEFAULT_COUNT), 10) || DEFAULT_COUNT, 1),
    100
  );
  const batchSize = 10;

  console.log("Story crawl (same as admin UI 'Generate and add stories')");
  console.log("  URL:", url);
  console.log("  Category:", categorySlug);
  console.log("  Count:", count);
  console.log("  Publish:", doPublish);
  console.log("  Est. time: ~1–2 min per 10 stories (Puppeteer)\n");

  const stories = await crawlStories(url, count, {
    batchSize,
    onProgress: (_current, total, msg) => {
      const ts = new Date().toLocaleTimeString();
      console.log(`  ${ts}  ${msg}`);
    },
  });
  console.log(`\n  Done. Extracted ${stories.length} story(ies).`);

  if (stories.length === 0) {
    console.log("  Nothing to save.");
    return;
  }

  console.log(`  Saving to Firestore...`);
  const { inserted } = await saveStoriesToFirestore(stories, categorySlug);
  console.log(`  Saved ${inserted} as draft under category "${categorySlug}".`);

  if (doPublish) {
    console.log(`  Publishing...`);
    const { published } = await publishStories({ categorySlug });
    console.log(`  Published ${published} story/stories. They will show on the site.`);
  } else {
    console.log("Run with --publish or use admin dashboard to publish and make them live.");
  }
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("5 NOT_FOUND") || (e as { code?: number })?.code === 5) {
    console.error("\nFirestore NOT_FOUND: Your Firestore database may not exist yet.");
    console.error("  → Go to Firebase Console → Build → Firestore Database");
    console.error("  → Click 'Create database' and choose a location");
    console.error("  → See: https://firebase.google.com/docs/firestore/quickstart");
  } else {
    console.error("Crawl failed:", e);
  }
  process.exit(1);
});
