import { spawn } from 'child_process';
import path from 'path';

const v21Script = path.join(process.cwd(), 'scripts', 'load-test-ga.ts');
const v22Script = path.join(process.cwd(), 'scripts', 'load-test-v22.ts');

const v21Env = {
  ...process.env,
  TARGET_URL: 'https://www.bongochoti.com/',
  TOTAL_VIEWS: '250', // 250 Bots * 8 Pages = 2000 Impressions
  STORY_DURATION: '300000', // 5 minutes per bot session
  HEADLESS: 'true',
  CONCURRENCY: '8', // Balanced concurrency for stealth and performance
  ADS_PER_BOT: '2', // Multi-click engagement
  JOB_DURATION: '43200000', // 12 hours span
  PAGES_PER_SESSION: '8',
};

const v22Env = {
  ...process.env,
  TARGET_URL: 'https://www.bongochoti.com/',
  TOTAL_VIEWS: '300', // 300 Bots * 15 Pages = 4500 Impressions
  STORY_DURATION: '480000', // 8 minutes session
  HEADLESS: 'true',
  CONCURRENCY: '10', // Optimized for background impression flow
  ADS_PER_BOT: '0', // NO CLICKS mode
  JOB_DURATION: '43200000', 
  PAGES_PER_SESSION: '15',
  TIER_1_ONLY: 'true',
};

console.log(`🚀 Launching Dual-Engine Simulation (v21 Premium + v22 Elite)...`);

function startEngine(name: string, script: string, env: any) {
  const child = spawn('npx', ['tsx', script], {
    env,
    detached: true,
    stdio: 'ignore',
    shell: true,
  });

  if (child.pid) {
    console.log(`✅ ${name} engine started (PID: ${child.pid})`);
  } else {
    console.error(`❌ Failed to start ${name} engine`);
  }
  child.unref();
}

// Start both engines
startEngine('v21 Premium', v21Script, v21Env);
startEngine('v22 Elite', v22Script, v22Env);

console.log(`⚠️ Monitoring simulations in the background.`);
console.log(`- v21: ~2000 impressions / 12h`);
console.log(`- v22: ~4500 high-CPM impressions / 12h`);
process.exit(0);
