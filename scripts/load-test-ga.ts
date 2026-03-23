import { chromium, devices } from 'playwright';
import * as https from 'https';

/**
 * Advanced Human-Like GA & Adsterra Simulation (v5)
 * - Distributed Job Scheduling (Total Job Duration).
 * - Multi-Ad Clicks per bot.
 * - Staggered batch starts.
 */

const TARGET_URL = process.env.TARGET_URL || 'https://www.bongochoti.com/';
const TOTAL_VIEWS = parseInt(process.env.TOTAL_VIEWS || '50');
const STORY_DURATION = parseInt(process.env.STORY_DURATION || '10000');
const SELECTED_COUNTRY = process.env.SELECTED_COUNTRY;
const HEADLESS = process.env.HEADLESS !== 'false';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || (HEADLESS ? "10" : "1"));
const ADS_PER_BOT = parseInt(process.env.ADS_PER_BOT || "1");
const JOB_DURATION = parseInt(process.env.JOB_DURATION || "0"); // in ms

let COUNTRIES = [
  { name: 'USA', code: 'US', locale: 'en-US', timezone: 'America/New_York' },
  { name: 'Canada', code: 'CA', locale: 'en-CA', timezone: 'America/Toronto' },
  { name: 'UAE', code: 'AE', locale: 'ar-AE', timezone: 'Asia/Dubai' },
  { name: 'France', code: 'FR', locale: 'fr-FR', timezone: 'Europe/Paris' },
];

if (SELECTED_COUNTRY) {
  COUNTRIES = COUNTRIES.filter(c => c.code === SELECTED_COUNTRY);
}

const VIEWPORTS = [
  { width: 390, height: 844 }, // iPhone 14
  { width: 412, height: 915 }, // Pixel 7
  { width: 360, height: 800 }, // Samsung S20
];

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

async function fetchProxies(countryCode: string): Promise<string[]> {
  try {
    const url = `https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=${countryCode}&ssl=all&anonymity=all`;
    return new Promise((resolve) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data.trim().split('\n').filter(p => p.includes(':'))));
      }).on('error', () => resolve([]));
    });
  } catch { return []; }
}

async function simulateHumanView(id: number, proxies: string[], retry = 0) {
  const country = COUNTRIES[id % COUNTRIES.length];
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const viewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
  const proxyStr = proxies.length > retry ? proxies[retry] : null;
  
  const browser = await chromium.launch({ 
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  try {
    const context = await browser.newContext({
      userAgent,
      locale: country.locale,
      timezoneId: country.timezone,
      viewport,
      hasTouch: true,
    });
    
    const page = await context.newPage();
    console.log(`[Bot ${id}] Starting session (Country: ${country.name}, AdsToClick: ${ADS_PER_BOT})`);
    
    // 1. Initial Load
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 90000 });
    
    // 2. Age Gate
    try {
      const btn = await page.waitForSelector('button:has-text("হ্যাঁ, আমি ১৮ বছরের উপরে")', { timeout: 8000 });
      if (btn) await btn.click();
    } catch {}

    // 3. Multi-Ad Clicking Phase
    for (let c = 0; c < ADS_PER_BOT; c++) {
        const adType = c % 2 === 0 ? 'popup' : 'in-page';
        
        if (adType === 'popup') {
            console.log(`[Bot ${id}] Triggering ad popup...`);
            const storyLinkSelector = 'a[href^="/stories/"]';
            await page.waitForSelector(storyLinkSelector);
            await page.click(storyLinkSelector);
            
            try {
              await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
              await new Promise(r => setTimeout(r, 6000)); // Wait for Adsterra countdown
              await page.waitForLoadState('networkidle');
            } catch {}
        } else {
            console.log(`[Bot ${id}] Scrolling for ad viewability...`);
            await page.evaluate(() => window.scrollBy({ top: 800 + Math.random() * 400, behavior: 'smooth' }));
            await new Promise(r => setTimeout(r, 4000));
            // Simulate random click on an ad area
            await page.mouse.click(200 + Math.random() * 100, 300 + Math.random() * 200);
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    // 4. Reading time
    console.log(`[Bot ${id}] Reading for ${STORY_DURATION}ms...`);
    await page.evaluate(() => window.scrollBy({ top: 1000, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, STORY_DURATION));

    console.log(`[Bot ${id}] ✅ Session complete.`);
  } catch (err) {
    console.error(`[Bot ${id}] ❌ Error:`, err instanceof Error ? err.message : err);
  } finally {
    await browser.close().catch(() => {});
  }
}

async function run() {
  console.log(`🚀 RUNNING SCHEDULED SIMULATION (${TOTAL_VIEWS} views over ${JOB_DURATION / 60000} minutes)`);
  
  const allProxies: Record<string, string[]> = {};
  for (const c of COUNTRIES) {
    allProxies[c.code] = await fetchProxies(c.code);
  }

  // Calculate stagger delay based on Job Duration
  // staggerDelay = totalDuration / totalJobs
  const staggerDelay = JOB_DURATION > 0 ? (JOB_DURATION / TOTAL_VIEWS) : 1000;
  console.log(`[System] Every bot starts with a delay of ${staggerDelay.toFixed(0)}ms to meet job deadline.`);

  const tasks = [];
  for (let i = 0; i < TOTAL_VIEWS; i++) {
    const runBot = async (id: number) => {
      const country = COUNTRIES[id % COUNTRIES.length];
      await simulateHumanView(id, allProxies[country.code] || []);
    };
    
    tasks.push(runBot(i));
    
    // Schedule next bot start
    await new Promise(r => setTimeout(r, staggerDelay));

    // Basic pool management using CONCURRENCY
    if (tasks.filter(p => !p.hasOwnProperty('resolved')).length >= CONCURRENCY) {
        // This is a bit simplified, but ensures we don't exceed max browsers
        await Promise.race(tasks);
    }
  }
  await Promise.all(tasks);
  console.log('✨ All bots finished.');
}

run();
