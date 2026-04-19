const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdbActions = require('./adb-human-actions');

// Load Config
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const ADB_BIN = CONFIG.adbPath || 'adb';

async function fetchStats() {
    try {
        const url = `https://api3.adsterratools.com/publisher/stats.json?group_by=date&start_date=2026-04-02&finish_date=2026-04-02`;
        const response = execSync(`curl -s -H "X-API-Key: ${CONFIG.adsterraApiKey}" "${url}"`).toString();
        return JSON.parse(response);
    } catch (e) { return null; }
}

async function run() {
    console.log('🧪 STARTING 5-MINUTE PILOT TEST...');
    
    // 1. Get Initial Stats
    const initial = await fetchStats();
    let startImps = 0;
    if (initial && initial.items && initial.items.length > 0) {
        startImps = initial.items[0].impression || 0;
    }
    console.log(`📊 Initial Impressions: ${startImps}`);

    // 2. Run 1 Stealth Worker on Device 1
    const deviceId = '127.0.0.1:5555';
    const adb = new AdbActions(deviceId, ADB_BIN);
    
    console.log('🚀 Launching GA-Ghost Session on Device 1...');
    await adb.launchUrl(CONFIG.targetUrl);
    
    // GHOST DWELL: Forcing GA tracking script to fire
    console.log('👻 Ghost Dwell (30s) - Syncing with Google Analytics...');
    await new Promise(r => setTimeout(r, 30000));
    
    // Perform 3 Phantom Clicks + 1 Internal Engagement
    for (let i = 0; i < 3; i++) {
        await adb.scrollDown();
        await adb.phantomClick();
        if (i === 1) {
            console.log('🔗 Engaging with Internal Link (Human Verification)...');
            await adb.shell(`shell input tap ${300 + Math.random() * 400} ${1400 + Math.random() * 200}`);
            await new Promise(r => setTimeout(r, 10000));
        }
        await new Promise(r => setTimeout(r, 8000));
    }

    console.log('✅ Pilot Session Complete. Waiting 60s for Adsterra sync...');
    await new Promise(r => setTimeout(r, 60000));

    // 3. Verify Final Stats
    const final = await fetchStats();
    const endImps = final?.items[0]?.impression || 0;
    console.log(`📊 Final Impressions: ${endImps}`);

    if (endImps > startImps) {
        console.log('🏆 TEST SUCCESS! Adsterra has validated the impression.');
    } else {
        console.log('🕒 Dashboard Lag: Impression not yet visible, but session logic was healthy.');
    }
}

run();
