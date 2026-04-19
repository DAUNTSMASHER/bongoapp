const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const LD_CONSOLE = path.join(path.dirname(CONFIG.adbPath), 'ldconsole.exe');
const logPath = path.join(__dirname, 'farm.log');

// Helper to log to both console and file
function log(msg) {
    const timedMsg = `[${new Date().toLocaleTimeString()}] ${msg}`;
    console.log(timedMsg);
    fs.appendFileSync(logPath, timedMsg + '\n');
}

function runCmd(cmd) {
    return new Promise((resolve) => {
        exec(`"${LD_CONSOLE}" ${cmd}`, (err, stdout) => {
            resolve(stdout);
        });
    });
}

/**
 * 10x ROI Farm Orchestrator
 */
async function prepareInstances() {
    log(`💎 [10x ROI Farm] Preparing 4 LDPlayer instances... (Resource Optimized)`);
    for (let i = 0; i < 4; i++) {
        log(`   - Closing & Randomizing Instance ${i}...`);
        await runCmd(`quit --index ${i}`);
        await new Promise(r => setTimeout(r, 2000));
        await runCmd(`modify --index ${i} --imei auto --androidid auto --mac auto --model auto --manufacturer auto`);
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function launchInstances() {
    log(`🚀 [10x ROI Farm] Launching 4 instances (Staggered 45s)...`);
    for (let i = 0; i < 4; i++) {
        log(`   - Starting Instance ${i}...`);
        await runCmd(`launch --index ${i}`);
        await new Promise(r => setTimeout(r, 45000)); 
    }
}

async function runController() {
    log(`🎯 [10x ROI Farm] Starting V22 ROI Controller...`);
    const controllerPath = path.join(__dirname, 'v22-10x-roi-controller.js');
    
    const controller = exec(`node "${controllerPath}"`, {
        cwd: __dirname,
        detached: false,
        stdio: ['inherit', 'pipe', 'pipe']
    });

    controller.stdout.on('data', (data) => {
        process.stdout.write(data);
        fs.appendFileSync(logPath, data);
    });

    controller.stderr.on('data', (data) => {
        process.stderr.write(data);
        fs.appendFileSync(logPath, `[ERROR] ${data}`);
    });
    
    controller.on('exit', (code) => {
        log(`⚠️ [10x ROI Farm] Controller exited (Code: ${code}). Restarting in 60s...`);
        setTimeout(main, 60000);
    });
}

async function main() {
    try {
        console.log('🧹 [10x ROI Farm] Cleaning up ghost ADB processes...');
        exec(`${CONFIG.adbPath} kill-server`);
        await new Promise(r => setTimeout(r, 2000));
        
        fs.writeFileSync(logPath, `--- FARM LOG START: ${new Date().toLocaleString()} ---\n`);
        await prepareInstances();
        await launchInstances();
        await runController();
    } catch (e) {
        log(`❌ [10x ROI Farm] Critical Error: ${e.message}`);
        setTimeout(main, 30000);
    }
}

// Global Resiliency
process.on('uncaughtException', (err) => log(`⚠️ UNCAUGHT EXCEPTION: ${err.message}`));
process.on('unhandledRejection', (reason) => log(`⚠️ UNHANDLED REJECTION: ${reason}`));

main();
