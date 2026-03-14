/**
 * Crawl a story from URL and add via API (deployed site).
 * Use when local Firestore quota is exceeded.
 *
 * npx tsx scripts/crawl-and-add-story-from-url.ts <url> [categorySlug]
 */
import { crawlStoriesFromUrls } from "./crawler/crawlBanglaChotiSmart";
import { getLadyCoverImages } from "@/lib/coverImages";

const url = process.argv[2] || "";
const categorySlug = process.argv[3] || "swami-strir";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.bongochoti.com";

async function main() {
  if (!url.startsWith("http")) {
    console.error("Usage: npx tsx scripts/crawl-and-add-story-from-url.ts <url> [categorySlug]");
    process.exit(1);
  }

  console.log("Crawling:", url);
  const stories = await crawlStoriesFromUrls([url], categorySlug, {
    useFirecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
    usePlaywright: !process.env.VERCEL,
    qualityFilter: { minBodyLength: 500, minParagraphs: 1, rejectCtaEnding: false },
  });

  if (stories.length === 0) {
    console.error("No story extracted. Check URL or try with FIRECRAWL_API_KEY.");
    process.exit(1);
  }

  const story = stories[0];
  const covers = getLadyCoverImages();
  const coverImageUrl = covers.length ? covers[Math.floor(Math.random() * covers.length)] : undefined;

  console.log("Title:", story.title?.slice(0, 60) + "...");
  console.log("Body length:", story.body?.length);
  console.log("Posting to", baseUrl + "/api/admin/create-story");

  const res = await fetch(`${baseUrl}/api/admin/create-story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: story.title,
      body: story.body,
      categorySlug,
      coverImageUrl,
      status: "published",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("API error:", data?.error || res.statusText);
    process.exit(1);
  }

  console.log("✓ Story created and live. ID:", data.id);
  console.log("URL:", `${baseUrl}/stories/${data.id}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
