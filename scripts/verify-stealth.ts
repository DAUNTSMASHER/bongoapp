import { chromium, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ELITE STEALTH v4 - VERIFICATION SUITE
 * ------------------------------------
 * Diagnostics for Canvas, WebGL, JA4+, and S2C Referer.
 */

const TARGET_SITE = 'https://www.bongochoti.com/';
const VERIFY_DIR = path.join(__dirname, 'verification_results');

if (!fs.existsSync(VERIFY_DIR)) fs.mkdirSync(VERIFY_DIR);

const UA_PROFILES = [
    {
        name: 'Windows_Chrome_128',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        vendor: 'Google Inc.',
        renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x00009A49) Direct3D11 vs_5_0 ps_5_0, D3D11)',
        ch: { brands: [{ brand: 'Not;A=Brand', version: '24' }, { brand: 'Chromium', version: '128' }, { brand: 'Google Chrome', version: '128' }], mobile: false, platform: 'Windows' }
    }
];

const USA_PROXIES = (() => {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'premium-proxies.json'), 'utf8'));
    } catch (e) {
        return ["ltmtrcmo:4ut2stq8lezy@9.142.219.45:6209"];
    }
})();

function getEliteStealthScript(profile: any) {
    return `
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    if (navigator.userAgentData) {
        Object.defineProperty(navigator, 'userAgentData', {
            get: () => ({
                brands: ${JSON.stringify(profile.ch.brands)},
                mobile: ${profile.ch.mobile},
                platform: "${profile.ch.platform}",
                getHighEntropyValues: (hints) => Promise.resolve({
                    platform: "${profile.ch.platform}", platformVersion: "13.0.0", architecture: "x86", model: "", uaFullVersion: "128.0.0.0"
                })
            })
        });
    }
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type) {
        const ctx = this.getContext('2d');
        if (ctx) {
            const data = ctx.getImageData(0, 0, 1, 1);
            data.data[0] = data.data[0] ^ 1;
            ctx.putImageData(data, 0, 0);
        }
        return originalToDataURL.apply(this, arguments);
    };
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return "${profile.vendor}";
        if (parameter === 37446) return "${profile.renderer}";
        return getParameter.apply(this, arguments);
    };
    `;
}

async function verify() {
    const profile = UA_PROFILES[0];
    const proxy = USA_PROXIES[0];
    const [auth, host] = proxy.split('@');
    const [user, pass] = auth.split(':');

    console.log(`🚀 [Verification] Launching with Profile: ${profile.name}`);
    console.log(`🛡️  Using Proxy: ${host}`);

    const browser = await chromium.launch({
        headless: true,
        proxy: { server: `http://${host}`, username: user, password: pass },
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });

    const context = await browser.newContext({
        userAgent: profile.ua,
        locale: 'en-US',
        timezoneId: 'America/New_York'
    });

    await context.addInitScript(getEliteStealthScript(profile));
    const page = await context.newPage();

    try {
        // TEST 1: Referer Spoofing (S2C Verification)
        console.log('🧪 TEST 1: Referer Spoofing (S2C)...');
        const searchKeyword = "bongochoti latest stories";
        const spoofedRef = `https://www.google.com/search?q=${encodeURIComponent(searchKeyword)}&sourceid=chrome&ie=UTF-8`;
        
        await page.goto('https://www.whatismybrowser.com/detect/what-is-my-referrer', { 
            referer: spoofedRef, 
            waitUntil: 'domcontentloaded' 
        });
        await page.screenshot({ path: path.join(VERIFY_DIR, 'test1_referer.png'), fullPage: true });
        console.log('✅ TEST 1 Captured: test1_referer.png');

        // TEST 2: Device Fingerprint (Client Hints / WebGL)
        console.log('🧪 TEST 2: BrowserLeaks (WASM/Hardware)...');
        await page.goto('https://browserleaks.com/wasm', { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: path.join(VERIFY_DIR, 'test2_browserleaks.png'), fullPage: true });
        console.log('✅ TEST 2 Captured: test2_browserleaks.png');

        // TEST 3: PixelScan (Fingerprint Masking)
        console.log('🧪 TEST 3: PixelScan (Wait for analysis)...');
        await page.goto('https://pixelscan.net/', { waitUntil: 'load', timeout: 60000 });
        await new Promise(r => setTimeout(r, 10000)); // Wait for scan completion
        await page.screenshot({ path: path.join(VERIFY_DIR, 'test3_pixelscan.png'), fullPage: true });
        console.log('✅ TEST 3 Captured: test3_pixelscan.png');

    } catch (e: any) {
        console.error('❌ Verification Error:', e.message);
    } finally {
        await browser.close();
        console.log('\n🏁 Verification Complete. Review results in scripts/verification_results/');
    }
}

verify();
