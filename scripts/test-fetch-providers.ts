/**
 * Test auto-browse fetch providers (Firecrawl, BrowserCat, Playwright, fetch).
 * Run: npx tsx scripts/test-fetch-providers.ts [url]
 *
 * Loads .env for FIRECRAWL_API_KEY, BROWSERCAT_API_KEY.
 */

import "dotenv/config";
import {
  getAvailableProviders,
  fetchHtmlWithProvider,
  fetchHtmlWithFallback,
  type FetchProvider,
} from "@/lib/fetchHtmlProviders";

const TEST_URL = process.argv[2] || "https://www.banglachotikahinii.com/";

async function main() {
  console.log("═".repeat(60));
  console.log("FETCH PROVIDER TEST");
  console.log("═".repeat(60));
  console.log("URL:", TEST_URL);
  console.log("");

  const available = getAvailableProviders();
  console.log("Available providers:", available.join(", "));
  if (!process.env.FIRECRAWL_API_KEY?.trim()) {
    console.log("  (Set FIRECRAWL_API_KEY to enable Firecrawl)");
  }
  if (!process.env.BROWSERCAT_API_KEY?.trim()) {
    console.log("  (Set BROWSERCAT_API_KEY to enable BrowserCat)");
  }
  console.log("");

  for (const p of available) {
    if (p === "fetch" && available.includes("firecrawl")) continue; // skip fetch if we have cloud options
    try {
      process.stdout.write(`  Testing ${p}... `);
      const html = await fetchHtmlWithProvider(TEST_URL, p);
      const len = html?.length ?? 0;
      const hasLinks = (html || "").includes("href=");
      const hasH1 = (html || "").includes("<h1");
      console.log(`OK (${len} chars, links=${hasLinks}, h1=${hasH1})`);
    } catch (e) {
      console.log(`FAIL:`, String(e).slice(0, 80));
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("");
  console.log("Fallback chain test:");
  try {
    const { html, provider } = await fetchHtmlWithFallback(TEST_URL);
    console.log(`  First successful provider: ${provider}`);
    console.log(`  HTML length: ${html.length}`);
    console.log(`  Sample: ${html.slice(0, 120).replace(/\s+/g, " ")}...`);
  } catch (e) {
    console.log(`  FAIL:`, e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
