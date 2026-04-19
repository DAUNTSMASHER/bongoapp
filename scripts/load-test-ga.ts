import { chromium, devices, Page, BrowserContext } from 'playwright';
import * as https from 'https';
import * as http from 'http';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Advanced Human-Like GA & Adsterra Simulation (v21 Stealth)
 * - Domain Alignment: Optimized for bongochoti.com
 * - Multi-Zone Interaction: Handles 728x90, 300x250, 160x600, etc.
 * - Premium Smart Link: Targeted interaction with vmdgf6guj7.
 */

const TARGET_URL = process.env.TARGET_URL || 'https://www.bongochoti.com/';
const TOTAL_VIEWS = parseInt(process.env.TOTAL_VIEWS || '50');
const STORY_DURATION = parseInt(process.env.STORY_DURATION || '300000'); // v21 default: 5 mins
const SELECTED_COUNTRY = process.env.SELECTED_COUNTRY;
const HEADLESS = process.env.HEADLESS !== 'false';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || (HEADLESS ? "10" : "1"));
const ADS_PER_BOT = parseInt(process.env.ADS_PER_BOT || "2");
const JOB_DURATION = parseInt(process.env.JOB_DURATION || "0"); // in ms
const PAGES_PER_SESSION = parseInt(process.env.PAGES_PER_SESSION || "8"); // v21 default: 8 pages

let COUNTRIES = [
  { name: 'USA', code: 'US', locale: 'en-US', timezone: 'America/New_York' },
  { name: 'Canada', code: 'CA', locale: 'en-CA', timezone: 'America/Toronto' },
  { name: 'UK', code: 'GB', locale: 'en-GB', timezone: 'Europe/London' },
  { name: 'Germany', code: 'DE', locale: 'de-DE', timezone: 'Europe/Berlin' },
  { name: 'France', code: 'FR', locale: 'fr-FR', timezone: 'Europe/Paris' },
  { name: 'Australia', code: 'AU', locale: 'en-AU', timezone: 'Australia/Sydney' },
];

const WEBSHARE_URL = 'https://proxy.webshare.io/api/v2/proxy/list/download/xlcjsfwszfnccmjsicelspbluuhclimzknnidlvo/US-DE-GB/any/username/direct/-/?plan_id=13046208';

if (SELECTED_COUNTRY) {
  COUNTRIES = COUNTRIES.filter(c => c.code === SELECTED_COUNTRY);
}

const VIEWPORTS = [
  { width: 390, height: 844 }, // iPhone 14
  { width: 412, height: 915 }, // Pixel 7
  { width: 428, height: 926 }, // iPhone 14 Pro Max
];

const PREMIUM_ONLY = true; // Set to true to force high-CPM CPM Booster mode

function getRandomHeaders() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1'
    };
}

async function getProxyPool() {
  const premiumProxies: string[] = [];
  const freeProxies: string[] = [];
  
  const fetchFromUrl = (url: string): Promise<string[]> => {
    return new Promise((resolve) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
           if (data.includes('{"') || data.includes('Invalid')) {
               resolve([]);
               return;
           }
           const list = data.trim().split('\n')
             .filter(p => {
                const parts = p.trim().split(':');
                return parts.length >= 2 && !p.includes('{');
             })
             .map(p => {
                const parts = p.trim().split(':');
                if (parts.length === 4) {
                    return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
                }
                return `http://${p.trim()}`;
             });
           resolve(list);
        });
      }).on('error', () => resolve([]));
    });
  };

  // 1. Fetch Webshare
  try {
    const websharePros = await fetchFromUrl(WEBSHARE_URL);
    premiumProxies.push(...websharePros);
  } catch (e) {}

  // 2. Load Local Premium Proxies (proxies.txt)
  try {
    const filePath = path.join(__dirname, 'proxies.txt');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const premium = data.trim().split('\n').filter(p => p.includes(':'));
      premium.forEach(p => {
         const parts = p.trim().split(':');
         if (parts.length === 4) {
             premiumProxies.push(`http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`);
         } else {
             premiumProxies.push(`http://${p.trim()}`);
         }
      });
    }
  } catch (e) {}

  // 3. Fetch Geonode (High Quality Free)
  if (!PREMIUM_ONLY) {
    try {
      const GEONODE_URL = 'https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc';
      const geonodePros = await fetchFromUrl(GEONODE_URL);
      freeProxies.push(...geonodePros);
    } catch (e) {}
  }

  const pool = [...premiumProxies, ...freeProxies];
  return { 
    pool, 
    premiumCount: premiumProxies.length, 
    freeCount: freeProxies.length,
    isEliteMode: PREMIUM_ONLY 
  };
}

/** Generates a randomized hardware fingerprint to bypass Adsterra deduplication */
function generateFingerprint() {
    const viewports = [
        { width: 1920, height: 1080 },
        { width: 1440, height: 900 },
        { width: 390, height: 844 }, // iPhone 13
        { width: 414, height: 896 }, // XR
        { width: 1536, height: 864 }
    ];
    return {
        viewport: viewports[Math.floor(Math.random() * viewports.length)],
        platform: Math.random() > 0.5 ? 'Win32' : 'MacIntel',
        memory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
        cores: [2, 4, 8, 12][Math.floor(Math.random() * 4)],
    };
}

async function checkProxy(proxyUrl: string, timeout = 5000): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const url = new URL(proxyUrl);
            const socket = net.connect(Number(url.port), url.hostname, () => {
                socket.destroy();
                resolve(true);
            });
            socket.setTimeout(timeout);
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            socket.on('error', () => {
                socket.destroy();
                resolve(false);
            });
        } catch {
            resolve(false);
        }
    });
}

async function thinkingPause(min = 2000, max = 5000) {
    const ms = min + Math.random() * (max - min);
    await new Promise(r => setTimeout(r, ms));
}

async function humanScroll(page: Page) {
    const scrollAmount = 300 + Math.random() * 500;
    const direction = Math.random() > 0.1 ? 1 : -0.3;
    await page.evaluate(({amount, dir}) => {
        window.scrollBy({ top: amount * dir, behavior: 'smooth' });
    }, {amount: scrollAmount, dir: direction});
}

/** v20 Ultra-Stealth: Hardware-Level Anti-Detection */
const ULTRA_STEALTH_INJECTION = `
    // 1. Advanced Canvas Noise (Random Pixel Jitter)
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function(x, y, w, h) {
        const imageData = originalGetImageData.apply(this, arguments);
        for (let i = 0; i < imageData.data.length; i += 1024) {
            imageData.data[i] = imageData.data[i] ^ (Math.floor(Math.random() * 2));
        }
        return imageData;
    };

    // 2. WebGL Fingerprint Randomization
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // Spoof Vendor & Renderer with jitter
        if (parameter === 37445) return ['Intel Inc.', 'Google Inc.', 'Apple Inc.'][Math.floor(Math.random() * 3)];
        if (parameter === 37446) return ['Intel(R) Iris(TM) Graphics', 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)', 'Apple M1'][Math.floor(Math.random() * 3)];
        return getParameter.apply(this, arguments);
    };

    // 3. Mask Plugins & Navigator
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
`;

async function curvilinearMouseWander(page: Page) {
    const start = { x: Math.random() * 800, y: Math.random() * 600 };
    const end = { x: Math.random() * 800, y: Math.random() * 600 };
    // Move in a curve (simple Bezier-like)
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = start.x + (end.x - start.x) * t + Math.sin(t * Math.PI) * 50;
        const y = start.y + (end.y - start.y) * t + Math.cos(t * Math.PI) * 30;
        await page.mouse.move(x, y, { steps: 2 });
    }
}

async function engageWithLandingPage(page: Page, botId: number) {
    console.log(`[Bot ${botId}] 🕵️ v20 Ultra-Stealth Engagement...`);
    const startTime = Date.now();
    const duration = 30000 + Math.random() * 20000; // 30-50 seconds
    
    await page.addInitScript(ULTRA_STEALTH_INJECTION);

    while (Date.now() - startTime < duration) {
        await humanScroll(page);
        await curvilinearMouseWander(page);
        if (Math.random() > 0.8) {
            await page.mouse.click(Math.random() * 400, Math.random() * 400);
        }
        await thinkingPause(4000, 9000);
    }
}

async function findAndClickOverlay(page: Page, botId: number): Promise<boolean> {
    try {
        const isOverlay = await page.evaluate(() => {
            const points = [{x: 100, y: 100}, {x: 200, y: 300}, {x: 300, y: 500}];
            const elements = points.map(p => document.elementFromPoint(p.x, p.y));
            const first = elements[0];
            // If the same element is at multiple points and it's large/fixed, it's likely an overlay
            return elements.every(el => el && el === first && el.tagName !== 'BODY' && el.tagName !== 'HTML');
        });

        if (isOverlay) {
            console.log(`[Bot ${botId}] 🛡️ Invisible overlay detected! Triggering Popunder...`);
            return true;
        }
    } catch (e) {}
    return false;
}

async function handleAdsterraClick(page: Page, context: BrowserContext, botId: number, type: 'social' | 'any' | 'smart-link') {
    try {
        // 1. Check for Popunder Overlay first if 'any'
        if (type === 'any' || Math.random() > 0.4) {
            const hasOverlay = await findAndClickOverlay(page, botId);
            if (hasOverlay) {
                const x = 50 + Math.random() * 300;
                const y = 100 + Math.random() * 400;
                const popupPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
                await page.mouse.click(x, y);
                const popup = await popupPromise;
                if (popup) {
                    console.log(`[Bot ${botId}] ✅ Popunder Triggered!`);
                    await popup.waitForLoadState('domcontentloaded').catch(() => {});
                    await engageWithLandingPage(popup, botId);
                    await popup.close().catch(() => {});
                    return true;
                }
            }
        }

        // 2. Specialized Smart Link Interaction (High Revenue)
        if (type === 'smart-link' || type === 'any') {
            const smartLinkBtn = await page.$('a:has-text("Continue"), a:has-text("Next Story"), a:has-text("চালিয়ে পড়ুন"), a:has-text("পরবর্তী গল্প")');
            if (smartLinkBtn) {
                console.log(`[Bot ${botId}] 🎯 Found Smart Link Button. Clicking...`);
                const popupPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
                await smartLinkBtn.click();
                const popup = await popupPromise;
                if (popup) {
                    console.log(`[Bot ${botId}] ✅ Smart Link Triggered!`);
                    await popup.waitForLoadState('domcontentloaded').catch(() => {});
                    await engageWithLandingPage(popup, botId);
                    await popup.close().catch(() => {});
                    return true;
                }
            }
        }

        // 3. Social Bar / Interstitial / Multi-Format Banner detection
        const adSelectors = [
            'div[id^="adsterra_"]', 
            'a[href*="cardinaltangible.com"]',
            'div[class*="social-bar"]',
            'div[class*="interstitial"]',
            'a[href*="vmdgf6guj7"]', // New Smart Link Key
            'div[id^="container-"]', // New Banner Containers
            'div[onclick*="window.open"]'
        ];
        
        for (const selector of adSelectors) {
            const btn = await page.$(selector);
            if (btn) {
                const box = await btn.boundingBox();
                if (box && box.width > 5 && box.height > 5) {
                    console.log(`[Bot ${botId}] 🎯 Ad Banner found (${selector}). Clicking...`);
                    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: Math.floor(10 + Math.random() * 10) });
                    
                    const popupPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
                    await btn.click({ delay: 100 + Math.random() * 300 });
                    
                    const popup = await popupPromise;
                    if (popup) {
                        console.log(`[Bot ${botId}] ✅ Ad Click Success (Popup)!`);
                        await popup.waitForLoadState('domcontentloaded').catch(() => {});
                        await engageWithLandingPage(popup, botId);
                        await popup.close().catch(() => {});
                        return true;
                    } else {
                        // v21: Detect if the main page was redirected instead of opening a popup
                        await thinkingPause(3000, 5000);
                        const currentUrl = page.url();
                        if (!currentUrl.includes('bongochoti.com')) {
                            console.log(`[Bot ${botId}] 🔄 Redirected away. Returning to bongochoti.com...`);
                            await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});
                            return true;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error(`[Bot ${botId}] Click Error:`, e instanceof Error ? e.message : e);
    }
    return false;
}

async function simulateHumanView(id: number, proxies: string[]) {
  const country = COUNTRIES[id % COUNTRIES.length];
  const startTime = Date.now();
  
  let browser: any;
  let context: any;
  let page: any;

  const launchBrowser = async (proxyUrl: string | null) => {
    let proxyConfig = undefined;
    if (proxyUrl) {
        const url = new URL(proxyUrl);
        proxyConfig = {
            server: `${url.protocol}//${url.host}`,
            username: url.username || undefined,
            password: url.password || undefined
        };
    }

    browser = await chromium.launch({ 
        headless: HEADLESS,
        proxy: proxyConfig,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars'
        ]
    });

    const fp = generateFingerprint();
    const headers = getRandomHeaders();

    context = await browser.newContext({
        userAgent: headers['User-Agent'],
        viewport: fp.viewport,
        deviceScaleFactor: Math.random() > 0.5 ? 2 : 1,
        locale: country.locale,
        timezoneId: country.timezone,
        hasTouch: true,
        permissions: ['geolocation'],
    });

    // Elite Stealth: Inject hardware fingerprints (WebGL/Canvas/Platform)
    await context.addInitScript((config: any) => {
        // Mask Navigator
        Object.defineProperty(navigator, 'platform', { get: () => config.platform });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => config.memory });
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => config.cores });
        Object.defineProperty(navigator, 'webdriver', { get: () => false });

        // Mask WebGL (Unique GPU ID)
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        (HTMLCanvasElement.prototype as any).getContext = function(type: any) {
            const ctx = originalGetContext.apply(this, arguments as any);
            if (type === 'webgl' || type === 'experimental-webgl') {
                const originalGetParameter = (ctx as any).getParameter;
                (ctx as any).getParameter = function(param: any) {
                    if (param === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
                    if (param === 37446) return 'Intel(R) Iris(TM) Plus Graphics 640'; // UNMASKED_RENDERER_WEBGL
                    return originalGetParameter.apply(this, arguments as any);
                };
            }
            return ctx;
        };
    }, fp);

    context.setDefaultTimeout(60000);
    page = await context.newPage();
    
    // Analytics & Ad Script Monitoring
    page.on('request', (req: any) => {
        const url = req.url();
        if (url.includes('adsterra') || url.includes('cardinal') || url.includes('vmdgf6guj7')) {
            console.log(`[Bot ${id}] 📡 Ad Zone Triggered: ${url.substring(0, 40)}...`);
        }
    });

    page.on('response', (res: any) => {
        const url = res.url();
        if (url.includes('adsterra') || url.includes('cardinal') || url.includes('fu3mudeq') || url.includes('a54d29b3db')) {
            console.log(`[Bot ${id}] 📡 Ad Script Loaded: ${res.status()} ${url.substring(0, 30)}`);
        }
    });
  };

  try {
    let success = false;
    const maxProxyAttempts = 1; // Only try 1 proxy to avoid wasting time
    let proxyAttempt = 0;
    
    // Mix Direct and Proxy: 50/50 ratio for reliability
    const forceDirect = id % 2 === 0;

    if (!forceDirect && proxies.length > 0) {
        while (proxyAttempt < maxProxyAttempts && proxyAttempt < proxies.length) {
            const p = proxies[Math.floor(Math.random() * proxies.length)];
            console.log(`[Bot ${id}] 🌐 Attempting proxy: ${p}...`);
            
            if (await checkProxy(p)) {
                try {
                    await launchBrowser(p);
                    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
                    success = true;
                    break;
                } catch (e) {
                    console.log(`[Bot ${id}] ⚠️ Proxy failed. Falling back...`);
                    if (browser) await browser.close().catch(() => {});
                }
            }
            proxyAttempt++;
        }
    }
    
    if (!success) {
        console.log(`[Bot ${id}] 🚀 Using Direct Connection (Verified stable)`);
        await launchBrowser(null);
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 50000 });
    }

    try {
      const btn = await page.waitForSelector('button:has-text("হ্যাঁ, আমি ১৮ বছরের উপরে")', { timeout: 5000 });
      if (btn) await btn.click();
    } catch {}

    let pagesVisited = 0;
    let clicksDone = 0;

    await thinkingPause(3000, 6000);
    await curvilinearMouseWander(page);

    while (pagesVisited < PAGES_PER_SESSION && (Date.now() - startTime) < STORY_DURATION) {
        pagesVisited++;
        await thinkingPause(3000, 7000);
        await curvilinearMouseWander(page);
        await humanScroll(page);
        
        if (clicksDone < ADS_PER_BOT) {
            await thinkingPause(2000, 5000);
            const clicked = await handleAdsterraClick(page, context, id, pagesVisited === 1 ? 'any' : 'social');
            if (clicked) clicksDone++;
        }

        if (pagesVisited < PAGES_PER_SESSION) {
            const links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="/stories/"]')).map((a: any) => a.href));
            if (links.length > 0) {
                const nextUrl = links[Math.floor(Math.random() * Math.min(20, links.length))];
                await thinkingPause(3000, 6000);
                await page.goto(nextUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
                console.log(`[Bot ${id}] 📖 Visiting Page ${pagesVisited + 1}/${PAGES_PER_SESSION}`);
            } else { break; }
        }
        
        const timeLeft = STORY_DURATION - (Date.now() - startTime);
        const waitTime = Math.min(timeLeft, (STORY_DURATION / PAGES_PER_SESSION));
        if (waitTime > 5000) {
            console.log(`[Bot ${id}] 🕒 Thinking/Reading (${Math.round(waitTime/1000)}s)...`);
            const waitEnd = Date.now() + waitTime;
            while (Date.now() < waitEnd - 2000) {
                await humanScroll(page);
                await curvilinearMouseWander(page);
                await thinkingPause(8000, 15000);
            }
        }
    }
    
    const finalTimeLeft = STORY_DURATION - (Date.now() - startTime);
    if (finalTimeLeft > 0) { 
        console.log(`[Bot ${id}] 🕒 Wrapping up session (${Math.round(finalTimeLeft/1000)}s)...`);
        await new Promise(r => setTimeout(r, finalTimeLeft)); 
    }
    console.log(`[Bot ${id}] ✅ Session complete. Total Time: ${Math.round((Date.now() - startTime)/1000)}s`);
  } catch (err) {
    console.error(`[Bot ${id}] ❌ Error:`, err instanceof Error ? err.message : err);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

async function run() {
  const proxyInfo = await getProxyPool();
  const pool = proxyInfo.pool;
  const baseStagger = JOB_DURATION > 0 ? (JOB_DURATION / TOTAL_VIEWS) : 1000;
  
  console.log(`🚀 RUNNING ADSTERRA V21 ELITE (CPM Booster Mode)`);
  console.log(`- Status: ${proxyInfo.isEliteMode ? 'ELITE (Premium Only)' : 'Standard'}`);
  console.log(`- Proxy Pool: ${proxyInfo.pool.length} (Premium: ${proxyInfo.premiumCount}, Free: ${proxyInfo.freeCount})`);
  console.log(`- Mode: Hardware Fingerprinting (WebGL/Canvas) Activated`);
  console.log(`- Targets: ${TOTAL_VIEWS} bots (${TOTAL_VIEWS * PAGES_PER_SESSION} impressions) over ${JOB_DURATION / 60000 / 60} hours`);
  
  const tasks = [];
  for (let i = 0; i < TOTAL_VIEWS; i++) {
    tasks.push(simulateHumanView(i, pool));
    const jitteredStagger = baseStagger * (0.8 + Math.random() * 0.4);
    await new Promise(r => setTimeout(r, jitteredStagger));
    if (tasks.length >= CONCURRENCY) { await Promise.race(tasks); }
  }
  await Promise.all(tasks);
}

run();
