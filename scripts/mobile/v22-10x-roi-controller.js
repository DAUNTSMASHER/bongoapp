const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AdbActions = require('./adb-human-actions');

const MAX_WORKERS = 4; // Reduced to 4 as per user request to save PC resources
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const ADB_BIN = CONFIG.adbPath || 'adb';

/**
 * ADB Async Helper
 */
function adbAsyncShell(command) {
    return new Promise((resolve, reject) => {
        exec(`"${ADB_BIN}" ${command}`, (error, stdout, stderr) => {
            if (error) resolve(stdout || ''); // Resolve even on error to keep loop moving
            else resolve(stdout);
        });
    });
}

function notify(msg) {
    console.log(`📡 [Notify]: ${msg}`);
}

/**
 * ELITE BOT SESSION (GA GHOST & STEALTH OVERRIDE)
 */
async function workerSession(deviceId, workerId) {
    const adb = new AdbActions(deviceId, ADB_BIN);
    const persona = {
        scrollSpeed: 5000 + Math.random() * 10000,
        readingDwell: 15000 + Math.random() * 20000,
        jigglerProb: 0.2 + Math.random() * 0.4
    };
    
    console.log(`[Worker ${workerId}] 🔄 Initializing on ${deviceId}...`);

    try {
        // 1. Initial setup & Proxy Rotation
        await adb.updateScreenSize();
        await adb.unlockScreen();
        
        let pUser = '', pPass = '';
        if (CONFIG.proxies && CONFIG.proxies.length > 0) {
            const proxy = CONFIG.proxies[Math.floor(Math.random() * CONFIG.proxies.length)];
            if (proxy.includes('@')) {
                const [auth, host] = proxy.split('@');
                const [u, p] = auth.split(':');
                pUser = u; pPass = p;
                await adb.setProxy(host);
            } else {
                await adb.setProxy(proxy);
            }
        }

        await adb.home();
        await adb.wait(2000);
        
        console.log(`[Worker ${workerId}] 🚀 LAUNCHING ULTRA-ELITE SESSION: ${CONFIG.targetUrl}`);
        await adb.launchUrl(CONFIG.targetUrl);

        // AUTO-AUTH: Handle the proxy login dialog blindly
        if (pUser && pPass) {
            await adb.handleProxyAuth(pUser, pPass);
        }
        
        // 2. GHOST DWELL: Forcing GA tracking script to fire (45s)
        console.log(`[Worker ${workerId}] 👻 Ghost Dwell active (Building Site Trust)...`);
        await adb.wait(45000); 

        // 3. Bypass Age Gate & Cookie Consent
        await adb.shell('shell input tap 540 1800'); 
        await adb.wait(5000);

        // 4. Content Engagement Loop
        const totalPages = 3 + Math.floor(Math.random() * 5); // 3-8 pages for high conversion
        let pages = 0;

        while (pages < totalPages) {
            pages++;
            console.log(`[Worker ${workerId}] 📖 Page ${pages}/${totalPages} in progress...`);

            // Elite "Reading" Simulation (Micro-Stutters + Phantom Clicks)
            const scrolls = 8 + Math.floor(Math.random() * 12);
            for (let i = 0; i < scrolls; i++) {
                await adb.microStutterScroll();
                
                // Trigger Popunder (Mimicking human click-to-read)
                if (i % 3 === 0) await adb.phantomClick();
                
                await adb.wait(persona.readingDwell); 
                if (Math.random() > 0.8) await adb.scrollUp(); 
            }

            // HUMAN VERIFICATION: Link Navigation
            if (pages < totalPages) {
                console.log(`[Worker ${workerId}] 🔗 Navigating to internal content...`);
                // Tap randomized link area
                await adb.shell(`shell input tap ${300 + Math.random() * 400} ${1400 + Math.random() * 300}`);
                await adb.wait(15000); 
            }
        }

        console.log(`[Worker ${workerId}] ✅ SESSION COMPLETE. ROI STATUS: OPTIMIZED.`);
        notify(`✅ [Worker ${workerId}] Finished 10x ROI session on ${deviceId}.`);
        
        // Privacy Rotation (Bypass cookie-based bot flagging)
        if (Math.random() > 0.5) {
            await adbAsyncShell(`-s ${deviceId} shell pm clear com.android.chrome`);
        }
        await adb.home();
        await adb.lockScreen();

    } catch (e) {
        console.error(`[Worker ${workerId}] ❌ SESSION CRASHED: ${e.message}`);
    }
}

/**
 * Main Controller Loop
 */
async function main() {
    console.log('\n💎 LOCAL 10x ROI FARM INITIALIZING... 💎');
    console.log(`- Target: 7 LDPlayer Instances (Unlimited Duration)`);
    
    while (true) {
        let devices = [];
        try {
            const out = await adbAsyncShell('devices');
            devices = out.split('\n')
                .filter(line => line.includes('\tdevice'))
                .map(line => line.split('\t')[0]);
        } catch (e) {}

        if (devices.length === 0) {
            console.log('😴 Waiting for LDPlayer instances to boot...');
            await new Promise(r => setTimeout(r, 10000));
            continue;
        }

        console.log(`\n--- 🚀 STARTING ${Math.min(devices.length, MAX_WORKERS)}-WORKER REVENUE CYCLE ---`);
        const tasks = devices.slice(0, MAX_WORKERS).map((id, index) => {
             return new Promise(r => setTimeout(r, index * 20000)).then(() => workerSession(id, index + 1));
        });
        
        await Promise.all(tasks);
        
        console.log('\n--- 🧠 COOLDOWN: Rotating profiles before next cycle ---');
        await new Promise(r => setTimeout(r, (5 + Math.random() * 5) * 60 * 1000));
    }
}

process.on('unhandledRejection', (reason) => {
    console.error('⚠️ UNHANDLED ASYNC EXCEPTION:', reason);
});

main();
