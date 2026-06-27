import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/screener.html', { waitUntil: 'networkidle0' });

// Click SDGs 7, 13, 8 (clean energy, climate, decent work)
await page.evaluate(() => {
  [7, 13, 8].forEach(id => {
    const card = document.querySelector(`.sdg-card[data-id="${id}"]`);
    if (card) card.click();
  });
});
await new Promise(r => setTimeout(r, 300));

// Switch to "All" (default) — take screenshot
const outDir = '/Users/davidnguyen/Website/temporary screenshots';
const files = fs.readdirSync(outDir);
const nums = files.map(f => parseInt(f)).filter(n => !isNaN(n));
const run = (nums.length ? Math.max(...nums) : 0) + 1;

await page.screenshot({
  path: path.join(outDir, `${run}-screener-all.png`),
  fullPage: false,
  clip: { x: 0, y: 480, width: 1440, height: 820 }
});
console.log(`Saved ${run}-screener-all.png`);

// Switch to Stocks tab
await page.click('.type-pill[data-type="Stocks"]');
await new Promise(r => setTimeout(r, 200));
await page.screenshot({
  path: path.join(outDir, `${run}-screener-stocks.png`),
  fullPage: false,
  clip: { x: 0, y: 480, width: 1440, height: 820 }
});
console.log(`Saved ${run}-screener-stocks.png`);

await browser.close();
