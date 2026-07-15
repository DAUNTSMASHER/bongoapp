import { spawn } from 'child_process';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'scripts', 'load-test-v22.ts');

const env = {
  ...process.env,
  TARGET_URL: 'https://www.bongochoti.com/',
  TOTAL_VIEWS: '300', // Increased for impressions focus
  STORY_DURATION: '480000', // 8 minutes session
  SELECTED_COUNTRY: '', 
  HEADLESS: 'true',
  CONCURRENCY: '10', // Optimized for background impression flow
  ADS_PER_BOT: '0', // NO CLICKS mode
  JOB_DURATION: '43200000', 
  PAGES_PER_SESSION: '15', // Max impressions per proxy
  TIER_1_ONLY: 'true',
};

console.log(`🚀 Triggering v22 Elite (Hybrid Device Mode)...`);
console.log(`- Version: v22 Elite (Mobile/Desktop Rotation)`);
console.log(`- Goal: 4500 high-CPM impressions (300 Bots * 15 Pages)`);
console.log(`- Strategy: Hybrid Platform Spoofing (iPhone/Android/PC)`);
console.log(`- Engagement: 8 minutes per session`);
console.log(`- Duration: 12 Hours (Staggered)`);
console.log(`- Targeting: Tier-1 Countries (US, CA, GB, AU, DE)`);

const child = spawn('npx', ['tsx', scriptPath], {
  env,
  detached: true,
  stdio: 'ignore',
  shell: true,
});

if (child.pid) {
  console.log(`✅ v22 Elite Simulation started (PID: ${child.pid})`);
  console.log(`⚠️ Monitoring logs for high-CPM impressions in the background.`);
} else {
  console.error(`❌ Failed to start child process.`);
}

child.unref();
process.exit(0);
