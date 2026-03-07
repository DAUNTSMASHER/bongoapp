/**
 * CLI: Publish draft stories in Firestore.
 *
 * Run:
 *   npm run publish:stories              # publish all drafts
 *   npm run publish:stories -- sera      # publish drafts in category "sera"
 */

import { publishStories } from "./saveStoriesToFirestore";

async function main() {
  const args = process.argv.slice(2);
  const categorySlug = args[0]?.trim() || undefined;

  console.log("Publishing draft stories...");
  if (categorySlug) console.log("  Category:", categorySlug);
  else console.log("  All categories");

  const { published, total, skippedShort } = await publishStories({ categorySlug });
  if (total === 0) {
    console.log("No draft stories found. (Refresh doesn't create drafts – crawl new stories first.)");
  } else if (published === 0) {
    console.log(`Found ${total} draft(s) but published 0.`);
    if (skippedShort > 0) {
      console.log(`  → ${skippedShort} skipped: body must be > 3000 characters`);
    }
  } else {
    console.log(`Published ${published} story/stories. They will show on the site.`);
    if (skippedShort > 0) {
      console.log(`  (${skippedShort} skipped: body ≤ 3000 chars)`);
    }
  }
}

main().catch((e) => {
  console.error("Publish failed:", e);
  process.exit(1);
});
