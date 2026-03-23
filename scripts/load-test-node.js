/**
 * Node.js Load Test Script
 * Simulates 500 concurrent users hitting the homepage and checking for ad placements.
 */
const http = require('http');
const https = require('https');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000/';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '500');
const TIMEOUT = 120000; // 120s for 500 bots
const CLICK_SIMULATION = true;

async function simulateUser(id) {
  const stats = { id, ok: false, latency: 0, clickLatency: 0, error: null };
  
  try {
    const start = Date.now();
    const result = await makeRequest(TARGET_URL);
    stats.latency = Date.now() - start;
    stats.status = result.status;
    
    const hasAds = result.data.includes('data-pop-ad-placement') || result.data.includes('SmartLinkAd') || result.data.includes('cardinal');
    const hasBrand = result.data.includes('bongochoti');
    
    if (result.status === 200 && hasAds && hasBrand) {
      stats.ok = true;
      
      if (CLICK_SIMULATION) {
        const clickStart = Date.now();
        await makeRequest(`${TARGET_URL}stories/`).catch(() => {});
        stats.clickLatency = Date.now() - clickStart;
      }
    } else {
      stats.error = result.status !== 200 ? `Status ${result.status}` : (!hasAds ? 'No ads found (Body: ' + result.data.slice(0, 100).replace(/\n/g, ' ') + '...)' : (!hasBrand ? 'Brand missing' : 'Unknown'));
    }
  } catch (err) {
    stats.error = err.message;
  }
  
  return stats;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function runTest() {
  console.log(`🚀 Starting load test: ${CONCURRENCY} concurrent users...`);
  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    promises.push(simulateUser(i));
  }

  const results = await Promise.all(promises);
  const endTime = Date.now();

  const successCount = results.filter(r => r.ok).length;
  const failureCount = CONCURRENCY - successCount;
  const avgLatency = results.reduce((acc, r) => acc + (r.latency || 0), 0) / CONCURRENCY;
  const avgClickLatency = results.reduce((acc, r) => acc + (r.clickLatency || 0), 0) / successCount || 0;

  console.log('\n--- Load Test Results ---');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Total Requests: ${CONCURRENCY}`);
  console.log(`✅ Success (Ads found): ${successCount}`);
  console.log(`❌ Failures: ${failureCount}`);
  console.log(`⏱️ Avg Latency (Home): ${avgLatency.toFixed(2)}ms`);
  if (CLICK_SIMULATION) {
    console.log(`⏱️ Avg Click Latency (Story): ${avgClickLatency.toFixed(2)}ms`);
  }
  console.log(`🏁 Total Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);

  if (failureCount > 0) {
    console.log('\nSample Errors:');
    results.filter(r => !r.ok).slice(0, 5).forEach(r => {
      console.log(`- Bot ${r.id}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🌟 All bots successfully verified ad implementation!');
    process.exit(0);
  }
}

runTest();
