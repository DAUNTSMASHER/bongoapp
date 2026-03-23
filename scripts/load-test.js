import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Load Test Script
 * Simulates 500 concurrent bots hitting the home page.
 * Checks for 200 OK and basic content presence.
 * 
 * RUN COMMAND:
 * k6 run load-test.js
 */

export const options = {
  vus: 500, // 500 Virtual Users (bots)
  duration: '30s', // Run for 30 seconds
};

const SITE_URL = __ENV.SITE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(SITE_URL);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has brand text': (r) => r.body.includes('bongochoti'),
    'has ad placement': (r) => r.body.includes('data-pop-ad-placement'),
  });

  // Small sleep to simulate realistic user behavior (1s between pages)
  sleep(1);
}
