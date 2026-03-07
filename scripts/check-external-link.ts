/**
 * Test if external link (outboundUrl) works in a real browser.
 * Run: npx tsx scripts/check-external-link.ts
 * Uses Puppeteer to simulate a user clicking the link.
 */

import { initFirestore } from "./crawler/saveToFirestore";

async function main() {
  console.log("Testing external link with real browser (Puppeteer)...\n");

  const firestore = initFirestore();
  const snap = await firestore
    .collection("videos")
    .where("status", "==", "active")
    .limit(3)
    .get();

  if (snap.empty) {
    console.log("No videos found.");
    process.exit(0);
    return;
  }

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true });

  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  for (let i = 0; i < Math.min(3, snap.docs.length); i++) {
    const doc = snap.docs[i];
    const d = doc.data();
    const outbound = d.outboundUrl as string | undefined;
    const title = (d.title || "Video").slice(0, 45);

    if (!outbound) {
      console.log(`[${i + 1}] ${title}... — no outboundUrl`);
      continue;
    }

    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

      const res = await page.goto(outbound, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const status = res?.status() ?? 0;
      const html = await page.content();
      const hasPlayer = /<video|<iframe|<embed|get_file|player/i.test(html);
      const hasError = /media play link is not found|video not found|404|page not found/i.test(html);

      await page.close();

      if (status === 200) {
        if (hasError) {
          console.log(`[${i + 1}] ${title}...`);
          console.log(`     ✗ Page loads (200) but shows "media play link not found" or similar`);
        } else if (hasPlayer) {
          console.log(`[${i + 1}] ${title}...`);
          console.log(`     ✓ Page loads (200), has video player — external link works`);
        } else {
          console.log(`[${i + 1}] ${title}...`);
          console.log(`     ? Page loads (200), no obvious player markup`);
        }
      } else {
        console.log(`[${i + 1}] ${title}...`);
        console.log(`     ✗ HTTP ${status}`);
      }
    } catch (e) {
      console.log(`[${i + 1}] ${title}...`);
      console.log(`     ✗ ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  await browser.close();
  console.log("\nDone. If you see ✓ above, external link works in browser.");
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
