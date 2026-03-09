/**
 * Auto-browsing fetch providers for reliable web scraping.
 * Supports: Firecrawl, BrowserCat, Playwright (local), Puppeteer (local), fetch.
 *
 * Set env vars to enable:
 * - FIRECRAWL_API_KEY → use Firecrawl (cloud, handles anti-bot, returns clean HTML)
 * - BROWSERCAT_API_KEY → use BrowserCat (cloud Playwright, no local browser)
 */

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export type FetchProvider = "firecrawl" | "browsercat" | "playwright" | "puppeteer" | "fetch";

/** Check which providers are available (have API keys) */
export function getAvailableProviders(): FetchProvider[] {
  const available: FetchProvider[] = [];
  if (process.env.FIRECRAWL_API_KEY?.trim()) available.push("firecrawl");
  if (process.env.BROWSERCAT_API_KEY?.trim()) available.push("browsercat");
  available.push("playwright", "puppeteer", "fetch");
  return available;
}

/** Firecrawl: cloud scraping, returns clean HTML/markdown, handles JS & anti-bot */
export async function fetchHtmlFirecrawl(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not set");

  try {
    const Firecrawl = (await import("@mendable/firecrawl-js")).default;
    const app = new Firecrawl({ apiKey });
    const doc = await app.scrape(url, {
      formats: ["html", "markdown"],
      onlyMainContent: false,
    });
    if (doc?.html && typeof doc.html === "string" && doc.html.length > 100) {
      return doc.html;
    }
    if (doc?.markdown && typeof doc.markdown === "string") {
      const md = doc.markdown;
      const paras = md.split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, " ")}</p>`).join("");
      return `<body><article>${paras}</article></body>`;
    }
    throw new Error("Firecrawl: no content in response");
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

/** BrowserCat: cloud Playwright, connect instead of launch - no local browser needed */
export async function fetchHtmlBrowserCat(url: string): Promise<string> {
  const apiKey = process.env.BROWSERCAT_API_KEY?.trim();
  if (!apiKey) throw new Error("BROWSERCAT_API_KEY not set");

  const { chromium } = await import("playwright");
  const browser = await chromium.connect("wss://api.browsercat.com/connect", {
    headers: { "Api-Key": apiKey },
  });
  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (!res || res.status() >= 400) throw new Error(`HTTP ${res?.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    const html = await page.content();
    await context.close();
    return html;
  } finally {
    await browser.close();
  }
}

/** Local Playwright */
export async function fetchHtmlPlaywright(url: string): Promise<string> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
  });
  try {
    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9,bn;q=0.8" });
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (!res || res.status() >= 400) throw new Error(`HTTP ${res?.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    const html = await page.content();
    await context.close();
    return html;
  } finally {
    await browser.close();
  }
}

/** Local Puppeteer */
export async function fetchHtmlPuppeteer(url: string): Promise<string> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (!res || !res.ok()) throw new Error(`HTTP ${res?.status()}`);
    await new Promise((r) => setTimeout(r, 1500));
    return page.content();
  } finally {
    await browser.close();
  }
}

/** Plain fetch (often blocked by anti-bot) */
export async function fetchHtmlFetch(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Fetch HTML using specified provider */
export async function fetchHtmlWithProvider(url: string, provider: FetchProvider): Promise<string> {
  switch (provider) {
    case "firecrawl":
      return fetchHtmlFirecrawl(url);
    case "browsercat":
      return fetchHtmlBrowserCat(url);
    case "playwright":
      return fetchHtmlPlaywright(url);
    case "puppeteer":
      return fetchHtmlPuppeteer(url);
    case "fetch":
      return fetchHtmlFetch(url);
    default:
      return fetchHtmlPlaywright(url);
  }
}

/**
 * Fetch with automatic fallback chain.
 * Tries providers in order until one succeeds.
 */
export async function fetchHtmlWithFallback(
  url: string,
  preferredProviders?: FetchProvider[]
): Promise<{ html: string; provider: FetchProvider }> {
  const chain = preferredProviders?.length
    ? preferredProviders
    : (["playwright", "firecrawl", "browsercat", "puppeteer", "fetch"] as FetchProvider[]);

  const available = getAvailableProviders();
  for (const p of chain) {
    if (!available.includes(p)) continue;
    try {
      const html = await fetchHtmlWithProvider(url, p);
      if (html && html.length > 100) return { html, provider: p };
    } catch (e) {
      console.warn(`[fetchHtml] ${p} failed:`, String(e).slice(0, 80));
    }
  }
  throw new Error("All fetch providers failed");
}
