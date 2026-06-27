import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/screener.html', { waitUntil: 'networkidle0' });

await page.evaluate(() => {
  [5, 8].forEach(id => document.querySelector(`.sdg-card[data-id="${id}"]`).click());
});
await new Promise(r => setTimeout(r, 400));

// Hover first SDG positive dot to trigger global tooltip
const firstWrap = await page.$('.sdg-pos-wrap');
if (firstWrap) await firstWrap.hover();

// Scroll results into view
await page.evaluate(() => document.getElementById('results-wrap').scrollIntoView());
await new Promise(r => setTimeout(r, 200));

const outDir = '/Users/davidnguyen/Website/temporary screenshots';
const files = fs.readdirSync(outDir);
const nums = files.map(f => parseInt(f)).filter(n => !isNaN(n));
const run = (nums.length ? Math.max(...nums) : 0) + 1;

// Full screenshot so we can see where the table ended up
await page.screenshot({
  path: path.join(outDir, `${run}-tooltip-hover.png`),
  fullPage: false,
});
console.log(`Saved ${run}-tooltip-hover.png`);

await browser.close();
