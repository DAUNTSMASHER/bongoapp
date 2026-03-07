/**
 * Test crawlDetailPage for a single URL (with Puppeteer).
 * Run: npx tsx scripts/test-one-detail.ts
 */

async function main() {
  const url = "https://www.banglachotikahinii.com/videos/bengali-college-meye-anal-chudai-sex-clip/";
  // We need to call the internal crawlDetailPage - but it's not exported in a way we can easily test.
  // Instead, duplicate the extraction logic to verify.
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );
  await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
  const html = await page.content();
  await browser.close();

  const getFile = html.match(/["']?(\/videos\/get_file\/[^"'\s<>]+\.mp4[^"'\s<>]*)["']?/);
  const iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  console.log("get_file:", getFile ? "https://www.banglachotikahinii.com" + getFile[1] : "none");
  console.log("iframe:", iframe ? iframe[1] : "none");
}

main().catch(console.error);
