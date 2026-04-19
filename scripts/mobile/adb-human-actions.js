const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * AdbActions v5.0 (Mobile Elite 2026 Edition)
 * -------------------------------------------------------------
 * - App-Symmetry Multi-Tasking simulation
 * - Pressure-Jitter Touch (via micro-duration swipes)
 * - Anti-Fingerprint Navigation Logic
 * - Hardened Proxy Tunneling
 */

class AdbActions {
    constructor(deviceId, adbBin = 'adb') {
        this.deviceId = deviceId;
        this.adbBin = adbBin;
        this.width = 1080;
        this.height = 1920;
    }

    async updateScreenSize() {
        try {
            const { stdout } = await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell wm size`);
            const match = stdout.match(/(\d+)x(\d+)/);
            if (match) {
                this.width = parseInt(match[1]);
                this.height = parseInt(match[2]);
            }
        } catch (e) {
            console.error(`[ADB Error] Size detection failed for ${this.deviceId}: ${e.message}`);
        }
    }

    // Bezier Curve Logic (Human-like)
    async scrollDown() {
        const x = 300 + Math.random() * (this.width - 600);
        const startY = this.height * 0.75 + Math.random() * 100;
        const endY = this.height * 0.25 + Math.random() * 100;
        const duration = 800 + Math.random() * 600;
        
        // Micro-Stutter Scroll
        await this.shell(`shell input swipe ${Math.floor(x)} ${Math.floor(startY)} ${Math.floor(x)} ${Math.floor(startY - 300)} ${Math.floor(duration / 3)}`);
        await this.wait(200 + Math.random() * 400); 
        await this.shell(`shell input swipe ${Math.floor(x)} ${Math.floor(startY - 300)} ${Math.floor(x)} ${Math.floor(endY)} ${Math.floor(duration * 0.6)}`);
    }

    async scrollUp() {
        const startX = this.width / 2 + (Math.random() * 100 - 50);
        const startY = this.height * 0.2 + (Math.random() * 100);
        const endY = this.height * 0.8 - (Math.random() * 100);
        await this.swipeBezier(startX, startY, startX + (Math.random() * 20 - 10), endY, 900 + Math.random() * 500);
    }

    async swipeBezier(startX, startY, endX, endY, duration) {
        const steps = 12 + Math.floor(Math.random() * 6);
        const cp1X = startX + (Math.random() * 200 - 100);
        const cp1Y = startY + (Math.random() * 200 - 100);
        const cp2X = endX + (Math.random() * 200 - 100);
        const cp2Y = endY + (Math.random() * 200 - 100);

        let lastX = startX;
        let lastY = startY;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(this.bezier(startX, cp1X, cp2X, endX, t));
            const y = Math.floor(this.bezier(startY, cp1Y, cp2Y, endY, t));
            try {
                await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell input swipe ${lastX} ${lastY} ${x} ${y} ${Math.floor(duration / steps)}`);
            } catch (e) {}
            lastX = x;
            lastY = y;
        }
    }

    bezier(n1, n2, n3, n4, t) {
        return Math.pow(1 - t, 3) * n1 + 3 * Math.pow(1 - t, 2) * t * n2 + 3 * (1 - t) * Math.pow(t, 2) * n3 + Math.pow(t, 3) * n4;
    }

    async tap(x, y) {
        const jitterX = Math.floor(x + (Math.random() * 60 - 30));
        const jitterY = Math.floor(y + (Math.random() * 60 - 30));
        // Simulate "Pressure" by using a very short swipe (15-40ms) instead of a simple tap
        const pressDuration = 15 + Math.floor(Math.random() * 25);
        try {
            await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell input swipe ${jitterX} ${jitterY} ${jitterX} ${jitterY} ${pressDuration}`);
        } catch (e) {}
    }

    /**
     * App-Symmetry: Simulate a user multi-tasking to bypass "Single-Purpose Bot" detection
     */
    async simulateMultitasking() {
        console.log(`[Elite v5] 📱 Running App-Symmetry Task (Multitasking Simulation)...`);
        await this.shell(`shell input keyevent 187`); // Recent Apps
        await this.wait(2000);
        await this.shell(`shell input swipe 540 1500 540 500 500`); // Scroll recents
        await this.wait(1500);
        await this.shell(`shell input tap 540 1000`); // Return to app
        await this.wait(2000);
    }

    /**
     * Ghostly interaction to trigger Popunders
     */
    async phantomAction() {
        const x = this.width * 0.3 + Math.random() * (this.width * 0.4);
        const y = this.height * 0.4 + Math.random() * (this.height * 0.2);
        console.log(`[Elite v5] 🫥 Phantom interaction at ${Math.floor(x)},${Math.floor(y)}`);
        await this.tap(x, y);
    }

    async launchUrl(url) {
        try {
            // Use Chrome explicitly to avoid system-picker issues
            await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell am start -n com.android.chrome/com.google.android.apps.chrome.Main -d "${url}"`);
        } catch (e) {
            // Fallback to default browser
            await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell am start -a android.intent.action.VIEW -d "${url}"`);
        }
    }

    async lockScreen() { try { await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell input keyevent 26`); } catch (e) {} }
    async unlockScreen() { try { await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell input keyevent 82`); } catch (e) {} }
    async home() { try { await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell input keyevent 3`); } catch (e) {} }
    async back() { try { await execAsync(`"${this.adbBin}" -s ${this.deviceId} shell input keyevent 4`); } catch (e) {} }

    async shell(command) {
        try {
            const { stdout } = await execAsync(`"${this.adbBin}" -s ${this.deviceId} ${command}`);
            return stdout;
        } catch (e) {}
    }

    async setProxy(proxy) {
        try {
            const hostPort = proxy.includes('@') ? proxy.split('@')[1] : proxy;
            console.log(`[Elite v5] 🌐 Hardening Proxy Tunnel: ${hostPort}`);
            // Use both global and secure settings to ensure consistency 
            await this.shell(`shell settings put global http_proxy ${hostPort}`);
            await this.shell(`shell settings put secure http_proxy ${hostPort}`);
        } catch (e) {}
    }

    async clearBrowserData() {
        console.log(`[Elite v5] 🧹 Clearing Browser Data for clean session...`);
        try {
            await this.shell(`shell pm clear com.android.chrome`);
        } catch (e) {}
    }

    async wait(ms) {
        const jitter = ms * 0.15 * (Math.random() - 0.5);
        const finalMs = Math.max(800, ms + jitter);
        return new Promise(r => setTimeout(r, finalMs));
    }
}

module.exports = AdbActions;
