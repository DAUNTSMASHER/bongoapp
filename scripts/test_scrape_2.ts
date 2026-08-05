import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import * as path from 'path';

puppeteer.use(StealthPlugin());

async function debugScrape() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const url = `https://www.banglachotikahinii.com/videos/`;
  console.log(`Navigating to ${url}...`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 8000));

  const html = await page.content();
  fs.writeFileSync('debug_page.html', html);
  await page.screenshot({ path: 'debug_page.png' });
  console.log('Saved debug_page.html and debug_page.png');

  await browser.close();
}

debugScrape();
