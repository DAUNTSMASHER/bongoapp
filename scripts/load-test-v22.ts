import { chromium, Page, BrowserContext } from 'playwright';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

/**
 * v22 ELITE - High CPM Multi-Zone Simulation
 * - Upgraded from v21 with Python v22 Stealth Port
 * - Bezier-Curve Mouse Paths
 * - TIER-1 Only Premium Targeting
 * - Deep Ad Landing Page Engagement
 */

const TARGET_URL = process.env.TARGET_URL || 'https://www.bongochoti.com/';
const TOTAL_VIEWS = parseInt(process.env.TOTAL_VIEWS || '50');
const STORY_DURATION = parseInt(process.env.STORY_DURATION || '420000'); // 7 mins total
const SELECTED_COUNTRY = process.env.SELECTED_COUNTRY;
const HEADLESS = process.env.HEADLESS !== 'false';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || (HEADLESS ? "12" : "1"));
const ADS_PER_BOT = 0; // Impression-only mode as requested
const JOB_DURATION = parseInt(process.env.JOB_DURATION || "0"); 
const PAGES_PER_SESSION = parseInt(process.env.PAGES_PER_SESSION || "15");
const TIER_1_ONLY = process.env.TIER_1_ONLY === 'true' || true;

let COUNTRIES = [
  { name: 'USA', code: 'US', locale: 'en-US', timezone: 'America/New_York' },
  { name: 'Germany', code: 'DE', locale: 'de-DE', timezone: 'Europe/Berlin' },
  { name: 'UK', code: 'GB', locale: 'en-GB', timezone: 'Europe/London' },
  { name: 'Switzerland', code: 'CH', locale: 'de-CH', timezone: 'Europe/Zurich' },
  { name: 'Netherlands', code: 'NL', locale: 'nl-NL', timezone: 'Europe/Amsterdam' },
  { name: 'Japan', code: 'JP', locale: 'ja-JP', timezone: 'Asia/Tokyo' },
  { name: 'Canada', code: 'CA', locale: 'en-CA', timezone: 'America/Toronto' },
  { name: 'Australia', code: 'AU', locale: 'en-AU', timezone: 'Australia/Sydney' },
  { name: 'Malaysia', code: 'MY', locale: 'ms-MY', timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Kuwait', code: 'KW', locale: 'ar-KW', timezone: 'Asia/Kuwait' },
];

const WEBSHARE_URL = 'https://proxy.webshare.io/api/v2/proxy/list/download/xlcjsfwszfnccmjsicelspbluuhclimzknnidlvo/US-DE-GB/any/username/direct/-/?plan_id=13046208';

if (SELECTED_COUNTRY) {
  COUNTRIES = COUNTRIES.filter(c => c.code === SELECTED_COUNTRY);
}

const DEVICES = [
    {
        name: 'Windows Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        hasTouch: false,
        deviceScaleFactor: 1,
        isMobile: false
    },
    {
        name: 'Mac Desktop',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 },
        hasTouch: false,
        deviceScaleFactor: 2,
        isMobile: false
    },
    {
        name: 'iPhone 15 Pro',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        viewport: { width: 393, height: 852 },
        hasTouch: true,
        deviceScaleFactor: 3,
        isMobile: true
    },
    {
        name: 'Samsung Galaxy S23',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
        viewport: { width: 360, height: 800 },
        hasTouch: true,
        deviceScaleFactor: 3,
        isMobile: true
    }
];

function getRandomDevice() {
    return DEVICES[Math.floor(Math.random() * DEVICES.length)];
}

async function getProxyPool() {
  const FORCE_PROXY = process.env.FORCE_PROXY;
  if (FORCE_PROXY) {
      const list = FORCE_PROXY.split(',').map(p => {
          const parts = p.trim().split(':');
          if (parts.length === 4) {
              return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
          }
          return p.trim();
      });
      console.log(`[Proxy] 🛡️ Forced Proxy Mode: Using ${list.length} specified proxies.`);
      return { pool: list, count: list.length };
  }

  const premiumProxies: string[] = [];
  
  const fetchFromUrl = (url: string): Promise<string[]> => {
    return new Promise((resolve) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
           if (data.includes('{"') || data.includes('Invalid')) { resolve([]); return; }
           const list = data.trim().split('\n')
             .filter(p => p.trim().split(':').length >= 2)
             .map(p => {
                const parts = p.trim().split(':');
                if (parts.length === 4) return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
                return `http://${p.trim()}`;
             });
           resolve(list);
        });
      }).on('error', () => resolve([]));
    });
  };

  try {
    const websharePros = await fetchFromUrl(WEBSHARE_URL);
    premiumProxies.push(...websharePros);
  } catch (e) {}

  try {
    const filePath = path.join(__dirname, 'proxies.txt');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const local = data.trim().split('\n').filter(p => {
          return p.includes(':') && !p.startsWith('#');
      });
      local.forEach(p => {
         const parts = p.trim().split(':');
         if (parts.length === 4) premiumProxies.push(`http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`);
         else premiumProxies.push(`http://${p.trim()}`);
      });
    }
  } catch (e) {}

  // Filter for US if requested and pool is large
  if (process.env.SELECTED_COUNTRY === 'US') {
      const usIps = ['162.243', '67.223', '107.174', '38.83', '84.17', '64.90', '192.111', '64.49', '38.127', '149.20', '104.168', '23.94', '66.42', '192.163', '104.255', '167.99', '184.170', '192.154', '174.77'];
      const filtered = premiumProxies.filter(p => usIps.some(ip => p.includes(ip)));
      if (filtered.length > 0) {
          console.log(`[Proxy] 🇺🇸 US-Only Mode: Filtered ${filtered.length}/${premiumProxies.length} premium proxies.`);
          return { pool: filtered, count: filtered.length };
      }
  }

  return { pool: premiumProxies, count: premiumProxies.length };
}

function bezier(p0: number, p1: number, p2: number, p3: number, t: number) {
    return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
}

async function moveMouseBezier(page: Page, endX: number, endY: number) {
    const startX = Math.random() * 800;
    const startY = Math.random() * 600;
    const cp1X = Math.random() * 800;
    const cp1Y = Math.random() * 600;
    const cp2X = Math.random() * 800;
    const cp2Y = Math.random() * 600;
    
    const steps = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = bezier(startX, cp1X, cp2X, endX, t);
        const y = bezier(startY, cp1Y, cp2Y, endY, t);
        await page.mouse.move(x, y);
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
    }
}

async function humanScrollV22(page: Page) {
    const scrollAmount = 400 + Math.random() * 600;
    const direction = Math.random() > 0.15 ? 1 : -0.4;
    await page.evaluate(({amount, dir}) => {
        window.scrollBy({ top: amount * dir, behavior: 'smooth' });
    }, {amount: scrollAmount, dir: direction});
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000));
}

async function thinkingPause(min = 3000, max = 8000) {
    const ms = min + Math.random() * (max - min);
    await new Promise(r => setTimeout(r, ms));
}

const V22_ELITE_INJECTION = `
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(x, y, w, h) {
        const imageData = originalGetImageData.apply(this, arguments);
        // High-Entropy Noise: Jitter every 512th byte slightly differently
        for (let i = 0; i < imageData.data.length; i += 512) {
            imageData.data[i] = imageData.data[i] ^ (Math.floor(Math.random() * 2));
        }
        return imageData;
    };
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // UNMASKED_VENDOR_WEBGL (37445) & UNMASKED_RENDERER_WEBGL (37446)
        if (parameter === 37445) return ['Intel Inc.', 'Apple Inc.', 'Google Inc.'][Math.floor(Math.random() * 3)];
        if (parameter === 37446) return ['Intel(R) Iris(TM) Graphics 6100', 'Apple M1', 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)'][Math.floor(Math.random() * 3)];
        return getParameter.apply(this, arguments);
    };
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5, 6, 7] });
`;

async function engageWithLandingPage(page: Page, botId: number) {
    console.log(`[Bot ${botId}] 💎 High-CPM Engagement on Landing Page...`);
    const startTime = Date.now();
    const duration = 65000 + Math.random() * 60000; // 65-125 seconds for conversion credit
    
    await page.addInitScript(V22_ELITE_INJECTION);

    while (Date.now() - startTime < duration) {
        await humanScrollV22(page);
        const targetX = Math.random() * 600;
        const targetY = Math.random() * 600;
        await moveMouseBezier(page, targetX, targetY);
        
        if (Math.random() > 0.85) {
            await page.mouse.click(targetX, targetY);
        }
        await thinkingPause(5000, 12000);
    }
}

async function handleAdsterraClickV22(page: Page, context: BrowserContext, botId: number) {
    try {
        const adSelectors = [
            'div[id^="adsterra_"]', 
            'a[href*="cardinaltangible.com"]',
            'div[class*="social-bar"]',
            'div[class*="interstitial"]',
            'a[href*="vmdgf6guj7"]',
            'div[id^="container-"]',
            'div[onclick*="window.open"]'
        ];
        
        for (const selector of adSelectors) {
            const btn = await page.$(selector);
            if (btn) {
                const box = await btn.boundingBox();
                if (box && box.width > 5 && box.height > 5) {
                    console.log(`[Bot ${botId}] 🎯 Elite Ad Found: ${selector}. Engaging...`);
                    await moveMouseBezier(page, box.x + box.width / 2, box.y + box.height / 2);
                    
                    const popupPromise = context.waitForEvent('page', { timeout: 20000 }).catch(() => null);
                    await btn.click({ delay: 250 + Math.random() * 500 });
                    
                    const popup = await popupPromise;
                    if (popup) {
                        console.log(`[Bot ${botId}] ✅ Popunder/Page Triggered!`);
                        await popup.waitForLoadState('domcontentloaded').catch(() => {});
                        await engageWithLandingPage(popup, botId);
                        await popup.close().catch(() => {});
                        return true;
                    }
                }
            }
        }
    } catch (e) {}
    return false;
}

async function simulateHumanViewV22(id: number, proxies: string[]) {
  const country = COUNTRIES[id % COUNTRIES.length];
  const startTime = Date.now();
  let browser: any, context: any, page: any;

  const launch = async (proxyUrl: string | null) => {
    let proxyConfig = undefined;
    if (proxyUrl) {
        let normalizedProxy = proxyUrl;
        if (!normalizedProxy.includes('://')) {
            normalizedProxy = `http://${normalizedProxy}`;
        }
        try {
            const url = new URL(normalizedProxy);
            proxyConfig = { 
                server: `${url.protocol}//${url.host}`, 
                username: url.username || undefined, 
                password: url.password || undefined 
            };
        } catch (e) {
            proxyConfig = undefined;
        }
    }

    browser = await chromium.launch({ 
        headless: HEADLESS, 
        proxy: proxyConfig,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    // Special Weighting: Germany -> Windows ($42), US/CH -> iOS ($12)
    let device = getRandomDevice();
    if (country.code === 'DE' && Math.random() > 0.2) {
        device = DEVICES.find(d => d.name === 'Windows Desktop') || device;
    } else if (['US', 'CH', 'GB'].includes(country.code) && Math.random() > 0.3) {
        device = DEVICES.find(d => d.name === 'iPhone 15 Pro') || device;
    }

    // Social Referrer Spoofing (Facebook, Twitter, Instagram, Pinterest)
    const referrers = [
        'https://l.facebook.com/',
        'https://t.co/',
        'https://www.instagram.com/',
        'https://www.pinterest.com/',
        'https://www.youtube.com/'
    ];
    const referrer = referrers[Math.floor(Math.random() * referrers.length)];

    context = await browser.newContext({
        userAgent: device.userAgent,
        viewport: device.viewport,
        deviceScaleFactor: device.deviceScaleFactor,
        hasTouch: device.hasTouch,
        isMobile: device.isMobile,
        locale: country.locale,
        timezoneId: country.timezone,
        extraHTTPHeaders: {
            'Referer': referrer,
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Dest': 'document',
            'Accept-Language': `${country.locale},en;q=0.9`
        }
    });

    // Elite Hardware Fingerprinting (Memory, Cores, Platform)
    await context.addInitScript((config: any) => {
        Object.defineProperty(navigator, 'deviceMemory', { get: () => config.memory });
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => config.cores });
        Object.defineProperty(navigator, 'platform', { get: () => config.platform });
        Object.defineProperty(navigator, 'languages', { get: () => [config.locale, 'en-US', 'en'] });
        
        // Mocking battery status to avoid default 'fully charged' signature
        (navigator as any).getBattery = () => Promise.resolve({
            level: 0.5 + Math.random() * 0.4,
            charging: Math.random() > 0.5,
            chargingTime: 0,
            dischargingTime: Infinity,
            onlevelchange: null,
            onchargingchange: null
        });
    }, {
        memory: [4, 8, 16][Math.floor(Math.random() * 3)],
        cores: [4, 8, 12, 16][Math.floor(Math.random() * 4)],
        platform: device.isMobile ? 'iPhone' : (Math.random() > 0.5 ? 'Win32' : 'MacIntel'),
        locale: country.locale
    });
    page = await context.newPage();
  };

  try {
    const device = getRandomDevice();
    console.log(`[Bot ${id}] 📱 Device: ${device.name} (${country.code})`);
    
    let success = false;
    let attempts = 0;
    const maxAttempts = 10; // Increased for verification resilience

    while (!success && attempts < maxAttempts) {
        attempts++;
        const proxy = proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : null;
        console.log(`[Bot ${id}] 🌐 Session initializing (${country.code}) - Attempt ${attempts}/${maxAttempts}...`);
        
        try {
            await launch(proxy);
            await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
            success = true;
        } catch (e: any) {
            console.log(`[Bot ${id}] ⚠️ Connection failed with ${proxy || 'Direct'}: ${e.message ? e.message.substring(0, 50) : String(e).substring(0, 50)}...`);
            if (browser) await browser.close().catch(() => {});
            if (!proxy) break; // Direct failed, stop
        }
    }

    if (!success) {
        console.log(`[Bot ${id}] ❌ Failed to establish session after ${maxAttempts} attempts.`);
        return;
    }

    try {
      const gate = await page.waitForSelector('button:has-text("হ্যাঁ, আমি ১৮ বছরের উপরে")', { timeout: 10000 });
      if (gate) {
          await moveMouseBezier(page, 200, 400); 
          await gate.click();
      }
    } catch {}

    let pagesVisited = 0, clicksDone = 0;

    while (pagesVisited < PAGES_PER_SESSION && (Date.now() - startTime) < STORY_DURATION) {
        pagesVisited++;
        console.log(`[Bot ${id}] 📖 Reading Page ${pagesVisited}/${PAGES_PER_SESSION}...`);
        
        await thinkingPause(5000, 10000);
        await humanScrollV22(page);
        await moveMouseBezier(page, Math.random() * 800, Math.random() * 600);
        
        if (clicksDone < ADS_PER_BOT && pagesVisited > 1) {
            // Disabled in Impression-Only mode
            // const clicked = await handleAdsterraClickV22(page, context, id);
            // if (clicked) clicksDone++;
        }

        if (pagesVisited < PAGES_PER_SESSION) {
            const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="/stories/"]')).map((a: any) => a.href));
            if (links.length > 0) {
                const next = links[Math.floor(Math.random() * Math.min(15, links.length))];
                await moveMouseBezier(page, 400, 300);
                await page.goto(next, { waitUntil: 'domcontentloaded' }).catch(() => {});
            } else break;
        }
    }
    console.log(`[Bot ${id}] ✅ Session complete.`);
  } catch (err) {
    console.error(`[Bot ${id}] ❌ Error:`, err);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

async function run() {
  const proxyInfo = await getProxyPool();
  console.log(`🚀 RUNNING v22 ELITE (CPM BOOSTER)`);
  console.log(`- Targets: ${TOTAL_VIEWS} bots, ${PAGES_PER_SESSION} pages/ea, ${ADS_PER_BOT} clicks/ea`);
  console.log(`- Proxies: ${proxyInfo.count} Premium loaded`);
  
  const tasks = [];
  const baseStagger = JOB_DURATION > 0 ? (JOB_DURATION / TOTAL_VIEWS) : 2000;

  for (let i = 0; i < TOTAL_VIEWS; i++) {
    tasks.push(simulateHumanViewV22(i, proxyInfo.pool));
    await new Promise(r => setTimeout(r, baseStagger * (0.7 + Math.random() * 0.6)));
    if (tasks.length >= CONCURRENCY) await Promise.race(tasks);
  }
  await Promise.all(tasks);
}

run();
