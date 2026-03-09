/**
 * Crawl 2 stories and print FULL body + character names to terminal.
 * Run: npx tsx scripts/crawl-two-verbose.ts [url]
 */

import "dotenv/config";
import { crawlBanglaChotiSmart } from "./crawler/crawlBanglaChotiSmart";

const URL = "https://www.banglachotikahinii.com/category/bangla-housewife-sex-story/?asgtbndr=1";
const TARGET_COUNT = 2;
const CATEGORY = "grihobodhur";

async function main() {
  const url = process.argv[2] || URL;

  console.log("═".repeat(70));
  console.log("BANGLA CHOTI STORY EXTRACTOR — Full Output (2 Stories)");
  console.log("═".repeat(70));
  console.log("URL:", url);
  console.log("Target:", TARGET_COUNT);
  console.log("");

  const stories = await crawlBanglaChotiSmart(url, TARGET_COUNT, CATEGORY, {
    usePlaywright: true,
    qualityFilter: { minBodyLength: 800, minParagraphs: 1, rejectCtaEnding: true },
    onProgress: (current, target, msg) => {
      console.log(`  [${current}/${target}] ${msg}`);
    },
  });

  if (stories.length === 0) {
    console.log("\n⚠ No stories extracted. Site may block or filter too strict.");
    process.exit(1);
  }

  stories.forEach((s, i) => {
    const p = (s as { processed?: { blockCount: number; characterNames: string[]; characterCount: number; eroticTags: string[]; storyId: string; blocks: string[] } }).processed;

    console.log("\n" + "█".repeat(70));
    console.log(`STORY ${i + 1}: ${s.title}`);
    console.log("█".repeat(70));
    console.log(`Source: ${s.sourceUrl}`);
    console.log("");
    console.log("CHARACTERS (optimized extraction):");
    console.log(`  Count: ${p?.characterCount ?? 0}`);
    console.log(`  Names: ${p?.characterNames?.join(", ") || "—"}`);
    console.log("");
    console.log("STORY ID (for dedup):", p?.storyId ?? "—");
    console.log("");
    console.log("EROTIC TAGS:", p?.eroticTags?.slice(0, 15).join(", ") || "—");
    console.log("");
    console.log("BLOCKS:", p?.blockCount ?? 0);
    console.log("");
    console.log("FULL ARTICLE BODY:");
    console.log("─".repeat(70));
    console.log(s.body || "(empty)");
    console.log("─".repeat(70));
  });

  console.log("\n✓ Done. Extracted", stories.length, "stories.");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
