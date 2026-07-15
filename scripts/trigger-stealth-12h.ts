import { spawn } from 'child_process';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'scripts', 'load-test-ga.ts');

const env = {
  ...process.env,
  TARGET_URL: 'https://www.bongochoti.com/',
  TOTAL_VIEWS: '600', // 50 views per hour for 12 hours
  STORY_DURATION: '180000', // 3 minutes engagement
  SELECTED_COUNTRY: 'US', // Target US for higher revenue
  HEADLESS: 'true',
  CONCURRENCY: '5', // Lower concurrency for maximum stealth
  ADS_PER_BOT: '2', // 2 clicks per bot as requested
  JOB_DURATION: '43200000', // 12 hours in milliseconds
  PAGES_PER_SESSION: '3',
};

console.log(`🚀 Triggering 12-Hour Anti-Detection Stealth Simulation...`);
console.log(`- Goal: 1800 impressions (600 Bots * 3 Pages)`);
console.log(`- Goal: 1200 Social Banner Clicks (2 per Bot)`);
console.log(`- Mode: V14 Stealth (Hardware Jitter + Thinking Pauses)`);
console.log(`- Duration: 12 Hours`);
console.log(`- Targeting: Premium Proxy Priority (US)`);

const child = spawn('npx', ['tsx', scriptPath], {
  env,
  detached: true,
  stdio: 'ignore',
  shell: true,
});

if (child.pid) {
  console.log(`✅ Long-term simulation started (PID: ${child.pid})`);
  console.log(`⚠️ This process will run for 12 hours in the background.`);
} else {
  console.error(`❌ Failed to start child process.`);
}

child.unref();
process.exit(0);
