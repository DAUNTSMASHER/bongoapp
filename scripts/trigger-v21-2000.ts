import { spawn } from 'child_process';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'scripts', 'load-test-ga.ts');

const env = {
  ...process.env,
  TARGET_URL: 'https://www.bongochoti.com/',
  TOTAL_VIEWS: '250', // 250 Bots * 8 Pages = 2000 Impressions
  STORY_DURATION: '300000', // 5 minutes per bot session
  SELECTED_COUNTRY: '', // Rotate through all premium countries
  HEADLESS: 'true',
  CONCURRENCY: '8', // Balanced concurrency for stealth and performance
  ADS_PER_BOT: '2', // Multi-click engagement
  JOB_DURATION: '43200000', // 12 hours span (250 bots / 12 hours = ~20 bots per hour)
  PAGES_PER_SESSION: '8',
};

console.log(`🚀 Triggering v21 Premium Multi-Country Traffic Simulation...`);
console.log(`- Goal: 2000 impressions (250 Bots * 8 Pages)`);
console.log(`- Engagement: 5 minutes per session`);
console.log(`- Duration: 12 Hours (Stealth Staggering)`);
console.log(`- Targeting: Different Premium Countries (US, CA, GB, DE, FR, AU)`);
console.log(`- Mode: V21 Elite (Hardware Spoofing + Curvilinear Mouse)`);

const child = spawn('npx', ['tsx', scriptPath], {
  env,
  detached: true,
  stdio: 'ignore',
  shell: true,
});

if (child.pid) {
  console.log(`✅ v21 Premium Simulation started (PID: ${child.pid})`);
  console.log(`⚠️ Monitoring logs for 2000 impressions in the background.`);
} else {
  console.error(`❌ Failed to start child process.`);
}

child.unref();
process.exit(0);
