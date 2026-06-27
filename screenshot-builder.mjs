import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/portfolio.html', { waitUntil: 'networkidle0' });

// Click Build Portfolio tab
await page.click('#tabBuild');
await new Promise(r => setTimeout(r, 200));

// Load sample
await page.click('#loadSampleBuilder');
await new Promise(r => setTimeout(r, 400));

const outDir = '/Users/davidnguyen/Website/temporary screenshots';
const files = fs.readdirSync(outDir);
const nums = files.map(f => parseInt(f)).filter(n => !isNaN(n));
const run = (nums.length ? Math.max(...nums) : 0) + 1;

await page.screenshot({ path: path.join(outDir, `${run}-builder.png`), fullPage: true });
console.log(`Saved ${run}-builder.png`);
await browser.close();
