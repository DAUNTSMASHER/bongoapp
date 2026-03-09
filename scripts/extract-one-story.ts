/**
 * Extract one story from URL and print full output (no save).
 * Skips Firecrawl, uses Playwright/Puppeteer/fetch.
 * Run: npx tsx scripts/extract-one-story.ts <url>
 */
import "dotenv/config";
import { crawlStoriesFromUrls } from "./crawler/crawlBanglaChotiSmart";

const URL =
  process.argv[2] || "https://www.banglachotikahinii.com/bangla-illicit-sex-story/sosurer-kando-16/";
const CATEGORY = "porokia";

async function main() {
  console.log("═".repeat(70));
  console.log("BANGLA CHOTI STORY EXTRACTOR — Single URL");
  console.log("═".repeat(70));
  console.log("URL:", URL);
  console.log("Provider order: Playwright → Puppeteer → fetch (Firecrawl skipped)");
  console.log("");

  const stories = await crawlStoriesFromUrls([URL], CATEGORY, {
    useFirecrawl: false,
    usePlaywright: true,
    qualityFilter: { minBodyLength: 100, minParagraphs: 1, rejectCtaEnding: false },
    onProgress: (done, total, msg) => console.log(`  ${msg}`),
  });

  if (stories.length === 0) {
    console.log("\n⚠ No story extracted. Try playwright/puppeteer or check URL.");
    process.exit(1);
  }

  stories.forEach((s, i) => {
    const p = (s as { processed?: { characterNames: string[]; characterCount: number; eroticTags: string[]; storyId: string; blockCount: number } }).processed;

    console.log("\n" + "█".repeat(70));
    console.log(`STORY ${i + 1}: ${s.title}`);
    console.log("█".repeat(70));
    console.log(`Source: ${s.sourceUrl}`);
    console.log(`Summary: ${s.summary}`);
    console.log("");
    if (p) {
      console.log("CHARACTERS:", p.characterNames?.join(", ") || "—");
      console.log("STORY ID:", p.storyId);
      console.log("EROTIC TAGS:", p.eroticTags?.slice(0, 12).join(", ") || "—");
      console.log("");
    }
    console.log("FULL BODY:");
    console.log("─".repeat(70));
    console.log(s.body || "(empty)");
    console.log("─".repeat(70));
  });

  console.log("\n✓ Extracted", stories.length, "story/stories.");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
