import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'temporary screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

await page.goto('http://localhost:3000/impact-report.html', { waitUntil: 'networkidle0' });

// Select SDGs 7 (Clean Energy), 13 (Climate Action), 8 (Decent Work), 10 (Reduced Inequality)
const sdgIds = [7, 13, 8, 10, 3];
for (const id of sdgIds) {
  await page.click(`.sdg-card[data-id="${id}"]`);
  await new Promise(r => setTimeout(r, 100));
}

// Click "Try sample portfolio"
await page.click('#sample-btn');
await new Promise(r => setTimeout(r, 300));

// Screenshot the wizard state
const wizardShot = await page.screenshot({ fullPage: true });
writeFileSync(join(outDir, 'report-A-wizard.png'), wizardShot);
console.log('Saved: report-A-wizard.png');

// Click Generate
await page.click('#generate-btn');
await new Promise(r => setTimeout(r, 600));

// Screenshot report - top
const reportTop = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 900 } });
writeFileSync(join(outDir, 'report-B-top.png'), reportTop);
console.log('Saved: report-B-top.png');

// Scroll to middle
await page.evaluate(() => window.scrollTo(0, 800));
await new Promise(r => setTimeout(r, 300));
const reportMid = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 900 } });
writeFileSync(join(outDir, 'report-C-mid.png'), reportMid);
console.log('Saved: report-C-mid.png');

// Scroll to more
await page.evaluate(() => window.scrollTo(0, 1800));
await new Promise(r => setTimeout(r, 300));
const reportBot = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 900 } });
writeFileSync(join(outDir, 'report-D-bot.png'), reportBot);
console.log('Saved: report-D-bot.png');

// Full page
const fullPage = await page.screenshot({ fullPage: true });
writeFileSync(join(outDir, 'report-E-full.png'), fullPage);
console.log('Saved: report-E-full.png');

await browser.close();
console.log('Done.');
