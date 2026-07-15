import { spawn } from 'child_process';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'scripts', 'load-test-ga.ts');

const env = {
  ...process.env,
  TARGET_URL: 'https://www.bongochoti.com/',
  TOTAL_VIEWS: '100',
  STORY_DURATION: '130000', // ~2.1 minutes
  SELECTED_COUNTRY: '',
  HEADLESS: 'true',
  CONCURRENCY: '10',
  ADS_PER_BOT: '1',
  JOB_DURATION: '3600000', // 1 hour span
  PAGES_PER_SESSION: '3', // 100 sessions * 3 pages = 300 impressions
};

console.log(`🚀 Triggering Adsterra 300/100 Simulation...`);
console.log(`- Goal: 300 Emissions (100 Bots * 3 Pages)`);
console.log(`- Goal: 100 Clicks (1 Bot * 1 Click)`);
console.log(`- Average Time: 2+ minutes`);
console.log(`- Total Span: 1 Hour`);

const child = spawn('npx', ['tsx', scriptPath], {
  env,
  detached: true,
  stdio: 'ignore',
  shell: true,
});

if (child.pid) {
  console.log(`✅ Simulation started in the background (PID: ${child.pid})`);
} else {
  console.error(`❌ Failed to start child process.`);
}

child.unref();
process.exit(0);
