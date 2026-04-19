const { execSync } = require('child_process');
const AdbActions = require('./adb-human-actions');

/**
 * ADB Multi-Device Controller (AdBotiq-Style)
 * - Auto-discovers all connected emulators/phones
 * - Runs parallel high-CPM browsing sessions
 * - Human-like behavior and interaction
 */

const TARGET_URL = 'https://www.bongochoti.com/';
const SESSION_DURATION = 8 * 60 * 1000; // 8 minutes per session
const MAX_PAGES = 10;

async function runSession(deviceId, proxy) {
    const adb = new AdbActions(deviceId);
    console.log(`[Device ${deviceId}] 🚀 Starting Mobile Elite v5 session...`);

    try {
        await adb.updateScreenSize();
        
        // 1. Session Seasoning (Clean Start)
        await adb.unlockScreen();
        await adb.clearBrowserData().catch(() => {});
        await adb.wait(3000);

        // 2. High-Quality Proxy Sync (Elite Stealth)
        if (proxy) {
            await adb.setProxy(proxy);
            await adb.wait(2000);
            
            // Handle Auth if needed (using defaults for ltmtrcmo)
            if (proxy.includes('@')) {
                const [auth] = proxy.split('@');
                const [user, pass] = auth.split(':');
                await adb.handleProxyAuth(user, pass);
            }
        }

        // 3. Organic Pre-Flight (App-Symmetry)
        await adb.home();
        await adb.simulateMultitasking();
        await adb.wait(2000);

        // 3. Launch Target
        console.log(`[Device ${deviceId}] 🎯 Navigating to ${TARGET_URL}...`);
        await adb.launchUrl(TARGET_URL);
        await adb.wait(15000); // Heavy wait for 2026 rendering

        // 4. Handle Age Gate (Physiological Jitter)
        console.log(`[Device ${deviceId}] 🔞 Passing age gate...`);
        await adb.tap(adb.width / 2, adb.height / 2 + 150); 
        await adb.wait(5000);

        // 5. Deep Engagement Loop
        let pagesVisited = 1;
        const startTime = Date.now();

        while (pagesVisited < MAX_PAGES && (Date.now() - startTime) < SESSION_DURATION) {
            console.log(`[Device ${deviceId}] 📖 Engagement Page ${pagesVisited}/${MAX_PAGES}...`);

            // Random scrolling (Reading simulation)
            const scrolls = 6 + Math.floor(Math.random() * 10);
            for (let i = 0; i < scrolls; i++) {
                if (Math.random() > 0.8) await adb.phantomAction(); // Trigger Popunders
                await adb.scrollDown();
                await adb.wait(8000 + Math.random() * 12000); 
                
                // Occasional App-Switch to break bot signature
                if (Math.random() > 0.9) await adb.simulateMultitasking();
            }

            // Navigate to next random content
            console.log(`[Device ${deviceId}] 🔗 Seeking next high-value story...`);
            const targetX = adb.width * 0.2 + Math.random() * (adb.width * 0.6);
            const targetY = adb.height * 0.4 + Math.random() * (adb.height * 0.4);
            await adb.tap(targetX, targetY);
            
            pagesVisited++;
            await adb.wait(10000 + Math.random() * 8000);
        }

        console.log(`[Device ${deviceId}] ✅ Elite Session Finished.`);
        await adb.home();
        await adb.lockScreen().catch(() => {});

    } catch (e) {
        console.error(`[Device ${deviceId}] ❌ session failed:`, e.message);
    }
}

async function main() {
    console.log('📱 ADB MULTI-CONTROLLER (v24.1 Elite Android Farm)');
    console.log('-----------------------------------------------');
    console.log('🛡️ Stealth v5 Pressure-Jitter & App-Symmetry Engaged');

    const PREMIUM_PROXIES = (() => {
        try {
            const data = fs.readFileSync(path.join(__dirname, 'premium-proxies.json'), 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    })();

    // Discover devices
    let devices = [];
    try {
        const out = execSync('adb devices').toString();
        devices = out.split('\n')
            .filter(line => line.includes('\tdevice'))
            .map(line => line.split('\t')[0]);
    } catch (e) {
        console.error('❌ Failed to run ADB. Is it installed?');
        process.exit(1);
    }

    if (devices.length === 0) {
        console.log('⚠️ No Android devices or emulators found.');
        return;
    }

    console.log(`✅ Found ${devices.length} active screen(s). Deploying High-CPM Sessions...`);

    // Run parallel sessions with Proxy Rotation
    const sessions = devices.map((id, index) => {
        const proxy = PREMIUM_PROXIES[index % PREMIUM_PROXIES.length];
        return runSession(id, proxy);
    });
    
    await Promise.all(sessions);
    console.log('🏁 All Elite sessions finished.');
}

main();
