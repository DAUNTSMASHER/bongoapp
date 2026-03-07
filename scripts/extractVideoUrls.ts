/**
 * Extract direct MP4 and embed URLs from BanglaChotiKahinii video pages.
 * Uses static HTML parsing (no headless browser).
 *
 * Run: npx tsx scripts/extractVideoUrls.ts
 * Or with save: npx tsx scripts/extractVideoUrls.ts --save
 */

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface VideoResult {
  pageUrl: string;
  directUrl: string | null;
  embedUrl: string | null;
  title?: string;
}

/** Extract videourl (direct MP4) from ktplayer/flashvars in script block */
function extractDirectUrl(html: string): string | null {
  const match = html.match(/videourl\s+(https[^\s'"]+\.mp4)/i);
  if (match) return match[1].trim();
  // Fallback: get_file pattern
  const getFile = html.match(/https?:\/\/[^"'\s]+?\/videos\/get_file\/[^"'\s]+\.mp4/i);
  if (getFile) return getFile[0].replace(/["')\]]+$/, "");
  return null;
}

/** Extract embedUrl from script or iframe */
function extractEmbedUrl(html: string, baseUrl: string): string | null {
  const embedMatch = html.match(/embedUrl\s*[:=]\s*["']?(https?[^\s'"]+embed[^"'\s]*)["']?/i);
  if (embedMatch) return embedMatch[1].replace(/["')\]]+$/, "");
  const embedPath = html.match(/\/videos\/embed\/\d+/);
  if (embedPath) return new URL(embedPath[0], baseUrl).href;
  const iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframe) return new URL(iframe[1], baseUrl).href;
  return null;
}

/** Extract title from og:title or h1 */
function extractTitle(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1].trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].trim();
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (title) return title[1].split(/[|-]/)[0].trim();
  return "Video";
}

async function fetchHtmlWithPuppeteer(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    if (!res || res.status() === 403) throw new Error("HTTP 403");
    if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
    await new Promise((r) => setTimeout(r, 2000));
    return await page.content();
  } finally {
    await browser.close();
  }
}

async function fetchHtml(url: string, usePuppeteer = false): Promise<string> {
  if (usePuppeteer) return fetchHtmlWithPuppeteer(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.banglachotikahinii.com/",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (res.status === 403) throw new Error("HTTP 403");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export async function extractFromUrl(pageUrl: string, usePuppeteer = false): Promise<VideoResult> {
  const html = await fetchHtml(pageUrl, usePuppeteer);
  const directUrl = extractDirectUrl(html);
  const embedUrl = extractEmbedUrl(html, pageUrl);
  const title = extractTitle(html);
  return { pageUrl, directUrl, embedUrl, title };
}

export async function extractFromUrls(
  urls: string[],
  options?: { usePuppeteer?: boolean }
): Promise<VideoResult[]> {
  let usePuppeteer = options?.usePuppeteer ?? false;
  const results: VideoResult[] = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url || !url.includes("/videos/")) continue;
    const normalized = url.replace(/\/$/, "");
    process.stdout.write(`  [${i + 1}/${urls.length}] ${normalized.slice(0, 55)}... `);
    try {
      let r: VideoResult;
      try {
        r = await extractFromUrl(normalized, usePuppeteer);
      } catch (e) {
        if (String(e).includes("403") && !usePuppeteer) {
          usePuppeteer = true;
          process.stdout.write("(Puppeteer) ");
          r = await extractFromUrl(normalized, true);
        } else throw e;
      }
      results.push(r);
      console.log(r.directUrl ? "✓" : r.embedUrl ? "embed" : "✗");
    } catch (e) {
      results.push({ pageUrl: normalized, directUrl: null, embedUrl: null });
      console.log("ERR");
    }
    await new Promise((r) => setTimeout(r, usePuppeteer ? 1000 : 400));
  }
  return results;
}

async function saveToFirestore(
  results: VideoResult[],
  options?: { updateExisting?: boolean }
): Promise<{ inserted: number; updated: number; skipped: number }> {
  const { FieldValue } = await import("firebase-admin/firestore");
  const { initFirestore } = await import("./crawler/saveToFirestore");
  const firestore = initFirestore();
  const col = firestore.collection("videos");
  const updateExisting = options?.updateExisting ?? true;

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const r of results) {
    const slug = r.pageUrl.replace(/\/$/, "").split("/").pop() || "v";
    const id = `bck-${slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 60)}`;

    const docRef = col.doc(id);
    const existingSnap = await docRef.get();

    if (existingSnap.exists) {
      const data = existingSnap.data();
      const hasDirect = !!data?.directVideoUrl;
      const hasEmbed = !!data?.embedUrl;
      if (hasDirect && hasEmbed) {
        skipped++;
        continue;
      }
      if (updateExisting && (r.directUrl || r.embedUrl)) {
        const updates: Record<string, unknown> = {};
        if (!hasDirect && r.directUrl) updates.directVideoUrl = r.directUrl;
        if (!hasEmbed && r.embedUrl) updates.embedUrl = r.embedUrl;
        if (r.title) updates.title = r.title;
        if (Object.keys(updates).length > 0) {
          await docRef.update(updates);
          updated++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
      continue;
    }

    if (r.directUrl) {
      const dup = await col.where("directVideoUrl", "==", r.directUrl).limit(1).get();
      if (!dup.empty) {
        skipped++;
        continue;
      }
    }

    await docRef.set({
      id,
      title: r.title || slug,
      thumbnailUrl: "",
      outboundUrl: r.pageUrl,
      embedUrl: r.embedUrl || null,
      directVideoUrl: r.directUrl || null,
      tags: [],
      language: "bn",
      sourceSite: "banglachotikahinii",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });
    inserted++;
  }

  return { inserted, updated, skipped };
}

const VIDEO_URLS = [
  "https://www.banglachotikahinii.com/videos/dhaka-muslim-bone-gude-angul-nogno-mms/",
  "https://www.banglachotikahinii.com/videos/bangladeshi-gramer-bon-bhai-nagno-chudai/",
  "https://www.banglachotikahinii.com/videos/bangla-bhai-boro-bon-chodachudi-mms/",
  "https://www.banglachotikahinii.com/videos/sofik-sk-mms-viral-sex-bangali-couple/",
  "https://www.banglachotikahinii.com/videos/bangladeshi-boro-boobs-bhabhir-chudachudi/",
  "https://www.banglachotikahinii.com/videos/boro-iston-ebong-bhog-soho-bangla-muslim-meyer-nogno-clip/",
  "https://www.banglachotikahinii.com/videos/premiker-dwara-bangla-muslim-meyeder-ston-chuse/",
  "https://www.banglachotikahinii.com/videos/bangla-meyer-rosalo-ston-bhog-angul-nogno-mms/",
  "https://www.banglachotikahinii.com/videos/officeer-bosser-bangla-bhabi-nagno-sex-mms/",
  "https://www.banglachotikahinii.com/videos/bangla-boudir-protibeshir-sathe-choda-chudi/",
  "https://www.banglachotikahinii.com/videos/bangladeshi-swami-streer-chodachudi-video/",
  "https://www.banglachotikahinii.com/videos/prothom-rater-chuda-chudir-bangla-mms-video/",
  "https://www.banglachotikahinii.com/videos/gram-banglar-domptir-ghore-toiri-bangla-sex-video/",
  "https://www.banglachotikahinii.com/videos/gramer-poripokko-boudi-debor-ke-diye-chodacche/",
  "https://www.banglachotikahinii.com/videos/dhaka-meyer-gud-chodachodi-chacha-video/",
  "https://www.banglachotikahinii.com/videos/sonagachi-beshya-meyer-gud-chodachudi-video/",
  "https://www.banglachotikahinii.com/videos/bihari-gramer-bhabike-chudeche-porn-clip/",
  "https://www.banglachotikahinii.com/videos/bengali-college-meye-anal-chudai-sex-clip/",
  "https://www.banglachotikahinii.com/videos/bangladeshi-sali-tight-gud-chudche-sex-video/",
  "https://www.banglachotikahinii.com/videos/bangali-nri-girl-gud-chuda-bbc-porn-clip/",
  "https://www.banglachotikahinii.com/videos/bengali-didi-bhaike-blowjob-sexy-video/",
  "https://www.banglachotikahinii.com/videos/desi-truck-driver-bhabi-rukho-sex-clip/",
  "https://www.banglachotikahinii.com/videos/kolkata-bandhobi-garite-blowjob-hot-video/",
  "https://www.banglachotikahinii.com/videos/bihari-bhabi-shami-bondhu-sex-clip/",
  "https://www.banglachotikahinii.com/videos/bengali-meye-blowjob-garir-vitor-sex-clip/",
  "https://www.banglachotikahinii.com/videos/bhojpuri-bhabhi-gud-chodachudi-protibeshi-clip/",
  "https://www.banglachotikahinii.com/videos/desi-college-mayer-gud-choda-hot-video/",
  "https://www.banglachotikahinii.com/videos/kolkata-grihini-premikake-blowjob-sex-clip/",
  "https://www.banglachotikahinii.com/videos/bihari-bhabi-debare-blowjob-nude-video/",
  "https://www.banglachotikahinii.com/videos/howrah-meye-cousin-bhai-blowjob-clip/",
  "https://www.banglachotikahinii.com/videos/pakistani-meye-muslim-chacha-sex-video/",
  "https://www.banglachotikahinii.com/videos/bengali-taruni-jungle-blowjob-sex-clip/",
  "https://www.banglachotikahinii.com/videos/gujarati-bhabhi-lomba-lingo-chuse-video/",
  "https://www.banglachotikahinii.com/videos/siliguri-gramer-bhabi-sex-premika-clip/",
  "https://www.banglachotikahinii.com/videos/18-bochorer-meye-chodar-kolkata-sex-video/",
  "https://www.banglachotikahinii.com/videos/onicchuk-bhabhike-debor-chode/",
  "https://www.banglachotikahinii.com/videos/gramer-matir-barite-boudir-gud-mara/",
  "https://www.banglachotikahinii.com/videos/kolkata-massage-parlour-sex-scandal-video/",
  "https://www.banglachotikahinii.com/videos/hotele-bangali-sundori-mayer-sex-mms/",
  "https://www.banglachotikahinii.com/videos/dudhel-boudir-gud-marlam-jongoler-vitor/",
  "https://www.banglachotikahinii.com/videos/bangla-premiker-sathe-desi-meyer-hot-sex/",
  "https://www.banglachotikahinii.com/videos/bangla-grihinir-bangla-porn-video/",
  "https://www.banglachotikahinii.com/videos/dui-classmater-sex-video/",
  "https://www.banglachotikahinii.com/videos/adibasi-gramer-meyer-pond-marlam-prothonbar/",
  "https://www.banglachotikahinii.com/videos/dobka-boudir-mukh-o-gud-chodar-rogroge-porn-video/",
  "https://www.banglachotikahinii.com/videos/sexy-boudike-camerar-samne-chudlam/",
];

async function main() {
  const doSave = process.argv.includes("--save");
  const urls = [...VIDEO_URLS];

  console.log(`Extracting from ${urls.length} URLs...\n`);
  const results = await extractFromUrls(urls);

  console.log("\n--- Results ---");
  results.forEach((r) => {
    console.log(`${r.pageUrl}\t${r.directUrl ?? "null"}\t${r.embedUrl ?? "null"}`);
  });

  const withDirect = results.filter((r) => r.directUrl);
  console.log(`\n${withDirect.length}/${results.length} pages had direct MP4 URL.`);

  if (doSave) {
    console.log("\nSaving to Firestore...");
    const { inserted, updated, skipped } = await saveToFirestore(results);
    console.log(`Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
  } else {
    console.log("\nRun with --save to save to Firestore.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
