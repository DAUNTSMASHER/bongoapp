import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function auditAds() {
    console.log('🛡️  AUDITING LIVE AD-SERVING (Elite v4 Stealth Mode)...');
    
    // Using First Premium Proxy
    const envPath = path.join(__dirname, '..', '.env.local');
    const proxyData = fs.readFileSync(path.join(__dirname, 'premium-proxies.json'), 'utf8');
    const premiumProxies = JSON.parse(proxyData);
    const [auth, host] = premiumProxies[0].split('@');
    const [user, pass] = auth.split(':');

    const browser = await chromium.launch({ 
        headless: true,
        proxy: { server: `http://${host}`, username: user, password: pass },
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-gpu'
        ]
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });

    // Mirror the main bot's stealth logic
    await context.addInitScript(`
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        HTMLCanvasElement.prototype.toDataURL = function() { return 'data:image/png;base64,'; };
    `);

    const page = await context.newPage();

    let cardinalRequests = 0;

    page.on('request', request => {
        const url = request.url().toLowerCase();
        if (url.includes('cardinaltangible.com')) cardinalRequests++;
    });

    try {
        console.log('🚀 Navigating to Bongochoti...');
        await page.goto('https://www.bongochoti.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Human pause
        await new Promise(r => setTimeout(r, 5000));

        // 🎯 Trigger Interstitial Ad: Click a Story Link
        console.log('🔗 Clicking a story link to trigger interstitial ads...');
        const storyLink = await page.$('a[href^="/stories/"]');
        if (storyLink) {
            await storyLink.click();
            console.log('✅ Click performed. Waiting for Adsterra/Cardinal scripts to fire...');
            await new Promise(r => setTimeout(r, 15000)); // Wait for ad-scripts to load
        } else {
            console.warn('⚠️ No story links found on homepage. Audit may be incomplete.');
        }

        console.log('\n-----------------------------------------------');
        console.log(`📡 Ad Network Requests (cardinaltangible.com): ${cardinalRequests}`);
        console.log('-----------------------------------------------');

        if (cardinalRequests > 0) {
            console.log('✅ PASS: Adsterra (Cardinal) Ads are LIVE and triggering.');
        } else {
            console.error('❌ FAIL: No Adsterra/Cardinal signals detected.');
        }

    } catch (e: any) {
        console.error('❌ Audit Failed:', e.message);
    } finally {
        await browser.close();
    }
}

auditAds();
