import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/portfolio.html', { waitUntil: 'networkidle0' });

await page.click('#tickerInput');
await page.type('#tickerInput', 'VTI, VTSAX, VFIAX, VBTLX, SCHD, FXAIX, IWM, TLT');
await page.click('#scanBtn');
await new Promise(r => setTimeout(r, 600));

const outDir = '/Users/davidnguyen/Website/temporary screenshots';
const files = fs.readdirSync(outDir);
const nums = files.map(f => parseInt(f)).filter(n => !isNaN(n));
const run = (nums.length ? Math.max(...nums) : 0) + 1;

await page.screenshot({ path: path.join(outDir, `${run}-vti-portfolio.png`), fullPage: true });
console.log(`Saved ${run}-vti-portfolio.png`);
await browser.close();
