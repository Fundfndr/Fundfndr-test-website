import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/portfolio.html', { waitUntil: 'networkidle0' });

await page.evaluate(() => {
  document.getElementById('tickerInput').value = 'ICLN, ESGU, VFTAX, PARNX, XLV, AAPL, MSFT, VTI, QCLN, PHO';
  document.getElementById('scanBtn').click();
});
await new Promise(r => setTimeout(r, 800));

const outDir = '/Users/davidnguyen/Website/temporary screenshots';
const files = fs.readdirSync(outDir);
const nums = files.map(f => parseInt(f)).filter(n => !isNaN(n));
const run = (nums.length ? Math.max(...nums) : 0) + 1;

// Full page screenshot of results
await page.screenshot({
  path: path.join(outDir, `${run}-portfolio-full.png`),
  fullPage: true,
});
console.log(`Saved: ${run}-portfolio-full.png`);

await browser.close();
