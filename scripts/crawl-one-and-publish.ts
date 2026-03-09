/**
 * Crawl one story URL, save, and publish.
 * npx tsx scripts/crawl-one-and-publish.ts <url> [categorySlug]
 */
import { crawlStoriesFromUrls } from "./crawler/crawlBanglaChotiSmart";
import { saveSmartStoriesToFirestore, publishStories } from "./crawler/saveStoriesToFirestore";

const url = process.argv[2] || "https://www.banglachotikahinii.com/bangla-incest-choti/nongra-poribarer-nongra-chele/";
const categorySlug = process.argv[3] || "ojachar";

async function main() {
  console.log("Crawling:", url);
  console.log("Category:", categorySlug);

  const stories = await crawlStoriesFromUrls([url], categorySlug, {
    useFirecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
    usePlaywright: !process.env.VERCEL,
    qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: false },
  });

  if (stories.length === 0) {
    console.log("No story extracted.");
    process.exit(1);
  }

  const { inserted, skipped } = await saveSmartStoriesToFirestore(stories, categorySlug, {
    createVariantsOnDuplicate: true,
  });
  console.log(`Saved: ${inserted}, Skipped: ${skipped}`);

  const { published } = await publishStories({ categorySlug });
  console.log(`Published: ${published} story/stories.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
