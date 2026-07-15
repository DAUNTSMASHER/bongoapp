import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * v22.4 MOBILE ELITE - STEALTH V4 ANTI-FRAUD ENGINE
 * -------------------------------------------------------------
 * - High-CPM Mobile USA Targeting (iOS/Android)
 * - Touch Interaction & Smooth Swiping
 * - Hardware Spoofing (maxTouchPoints, Mobile Brands)
 * - Concurrent execution with Desktop version
 */

const TARGET_URL = 'https://www.bongochoti.com/';
const CONCURRENCY = 10; 
const SESSION_DURATION = 15 * 60 * 1000; // 15 mins
const STATS_FILE = path.join(__dirname, 'revenue_stats_mobile.json');

const REFERRERS = [
    'https://www.google.com/search?q=bangla+story',
    'https://www.bing.com/search?q=choti+kahani',
    'https://www.facebook.com/',
    'https://t.co/', // Twitter
    TARGET_URL
];

const MOBILE_UA_POOL = [
    // iPhone 15 Pro
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    // Samsung S24 Ultra
    'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36',
    // Pixel 8 Pro
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Mobile Safari/537.36',
    // iPad Pro (Mobile View)
    'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
];

const MOBILE_VIEWPORTS = [
    { width: 390, height: 844 }, // iPhone 12/13/14/15
    { width: 430, height: 932 }, // iPhone 14/15 Plus/Max
    { width: 412, height: 915 }, // S24 / Pixel 8
    { width: 360, height: 800 }  // Standard Android
];

let MOBILE_STATS = {
    startTime: new Date().toISOString(),
    totalImpressions: 0,
    eliteLandings: 0,
    errors: 0,
    estimatedCPM: 38.00, // Mobile USA yields higher CPM
    estimatedRevenue: 0,
    lastUpdate: new Date().toISOString()
};

if (fs.existsSync(STATS_FILE)) {
    try {
        const existing = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
        MOBILE_STATS.totalImpressions = existing.totalImpressions || 0;
        MOBILE_STATS.eliteLandings = existing.eliteLandings || 0;
        MOBILE_STATS.errors = existing.errors || 0;
    } catch (e) {}
}

function saveStats() {
    MOBILE_STATS.lastUpdate = new Date().toISOString();
    MOBILE_STATS.estimatedRevenue = (MOBILE_STATS.totalImpressions / 1000) * MOBILE_STATS.estimatedCPM;
    fs.writeFileSync(STATS_FILE, JSON.stringify(MOBILE_STATS, null, 2));
}

const USA_PROXIES = [
    "ltmtrcmo:4ut2stq8lezy@9.142.219.45:6209",
    "ltmtrcmo:4ut2stq8lezy@72.46.139.188:6748",
    "ltmtrcmo:4ut2stq8lezy@9.142.10.241:5897",
    "ltmtrcmo:4ut2stq8lezy@9.142.37.33:5204",
    "ltmtrcmo:4ut2stq8lezy@72.1.154.133:8024",
    "ltmtrcmo:4ut2stq8lezy@193.160.82.137:6109",
    "ltmtrcmo:4ut2stq8lezy@45.56.180.198:8432",
    "ltmtrcmo:4ut2stq8lezy@216.98.230.35:6488",
    "ltmtrcmo:4ut2stq8lezy@45.56.137.162:9227",
    "ltmtrcmo:4ut2stq8lezy@62.164.246.3:7728",
    "ltmtrcmo:4ut2stq8lezy@216.98.249.39:7020",
    "ltmtrcmo:4ut2stq8lezy@72.46.138.240:6466",
    "ltmtrcmo:4ut2stq8lezy@192.46.203.18:5984",
    "ltmtrcmo:4ut2stq8lezy@216.98.255.233:6855",
    "ltmtrcmo:4ut2stq8lezy@192.53.66.68:6174",
    "ltmtrcmo:4ut2stq8lezy@104.243.210.104:5752",
    "ltmtrcmo:4ut2stq8lezy@138.226.64.103:7794",
    "ltmtrcmo:4ut2stq8lezy@192.46.188.26:5685",
    "ltmtrcmo:4ut2stq8lezy@216.170.122.31:6069",
    "ltmtrcmo:4ut2stq8lezy@62.164.242.97:8674"
];

function getMobileStealthScript(ua: string) {
    const isIOS = ua.includes('iPhone') || ua.includes('iPad');
    
    return `
    // Mobile hardware spoofing
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'webdriver', { get: () => false });

    // Platform spoofing
    Object.defineProperty(navigator, 'platform', { get: () => '${isIOS ? 'iPhone' : 'Linux armv8l'}' });

    // Orientation spoofing
    window.screen.orientation.lock = () => Promise.resolve();
    
    // WebGL Vendor override for Mobile
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Apple Inc.';
        if (parameter === 37446) return 'Apple GPU';
        return getParameter.apply(this, arguments);
    };
    `;
}

async function smoothScrollMobile(page: Page) {
    const amount = 300 + Math.random() * 500;
    for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, amount / 10);
        await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
    }
}

async function engageWithMobileLanding(page: Page) {
    console.log(`📡 [Mobile Stealth] High-CPM Dwell Logic Engaged...`);
    const startTime = Date.now();
    const duration = 120000 + Math.random() * 60000; // 2-3 mins High Quality

    while (Date.now() - startTime < duration) {
        await smoothScrollMobile(page);
        await new Promise(r => setTimeout(r, 15000 + Math.random() * 15000));
        
        // Random tap to simulate interest
        if (Math.random() > 0.7) {
            const width = page.viewportSize()?.width || 390;
            const height = page.viewportSize()?.height || 844;
            await page.touchscreen.tap(Math.random() * width, Math.random() * height);
        }
    }
}

async function startMobileSession(id: number) {
    const proxy = USA_PROXIES[(id + 10) % USA_PROXIES.length]; // Staggered proxy selection
    const [auth, host] = proxy.split('@');
    const [user, pass] = auth.split(':');
    
    const identity = {
        ua: MOBILE_UA_POOL[id % MOBILE_UA_POOL.length],
        res: MOBILE_VIEWPORTS[id % MOBILE_VIEWPORTS.length],
        ref: REFERRERS[id % REFERRERS.length]
    };

    const browser = await chromium.launch({
        headless: true,
        proxy: { server: `http://${host}`, username: user, password: pass },
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });

    try {
        const context = await browser.newContext({
            userAgent: identity.ua,
            viewport: identity.res,
            isMobile: true,
            hasTouch: true,
            locale: 'en-US',
            timezoneId: 'America/New_York',
            extraHTTPHeaders: { 'Referer': identity.ref }
        });

        await context.addInitScript(getMobileStealthScript(identity.ua));
        const page = await context.newPage();

        console.log(`[Mobile Bot ${id}] 📱 Device: ${identity.ua.split(' ')[1]} | Res: ${identity.res.width}x${identity.res.height}`);
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 70000 });
        MOBILE_STATS.totalImpressions++;
        saveStats();

        // Pass Age Gate
        try {
            const gate = await page.waitForSelector('button:has-text("হ্যাঁ, আমি ১৮ বছরের উপরে")', { timeout: 15000 });
            if (gate) await gate.tap();
        } catch {}

        let pagesVisited = 0;
        const sessionStart = Date.now();

        while (pagesVisited < 15 && (Date.now() - sessionStart) < SESSION_DURATION) {
            pagesVisited++;
            MOBILE_STATS.totalImpressions++;
            saveStats();
            
            await smoothScrollMobile(page);
            await new Promise(r => setTimeout(r, 10000 + Math.random() * 10000));

            // Mobile Ad Engagement (Highest CPM)
            if (pagesVisited > 1 && Math.random() < 0.45) {
                const popupPromise = context.waitForEvent('page', { timeout: 30000 }).catch(() => null);
                
                // Tap center area
                await page.touchscreen.tap(100 + Math.random() * 100, 200 + Math.random() * 300);
                
                const popup = await popupPromise;
                if (popup) {
                    MOBILE_STATS.eliteLandings++;
                    console.log(`[Mobile Bot ${id}] 🔥 Premium Mobile Conversion!`);
                    await popup.waitForLoadState('domcontentloaded').catch(() => {});
                    await engageWithMobileLanding(popup);
                    await popup.close().catch(() => {});
                    saveStats();
                }
            }

            const links = await page.evaluate(() => 
                Array.from(document.querySelectorAll('a[href^="/stories/"]'))
                    .map((a: any) => a.href)
            );
            
            if (links.length > 0) {
                const next = links[Math.floor(Math.random() * Math.min(5, links.length))];
                await page.goto(next, { waitUntil: 'domcontentloaded' }).catch(() => {});
            } else break;
        }

    } catch (e: any) {
        MOBILE_STATS.errors++;
        console.error(`[Mobile Bot ${id}] ❌ Mobile Stealth Failure: ${e.message}`);
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('\n📱 v22.4 MOBILE ELITE - HIGH-CPM USA ENGINE ACTIVATED');
    console.log('----------------------------------------------------');
    console.log('⚡ Running CONCURRENTLY with Desktop Workers\n');
    
    let botCounter = 0;
    const activeTasks = new Set();

    while (true) {
        if (activeTasks.size < CONCURRENCY) {
            botCounter++;
            const task = startMobileSession(botCounter).finally(() => activeTasks.delete(task));
            activeTasks.add(task);
            
            process.stdout.write(`\r📱 MOBILE: Imp: ${MOBILE_STATS.totalImpressions} | Land: ${MOBILE_STATS.eliteLandings} | $${MOBILE_STATS.estimatedRevenue.toFixed(2)}    `);
        }
        await new Promise(r => setTimeout(r, 30000)); 
    }
}

main();
