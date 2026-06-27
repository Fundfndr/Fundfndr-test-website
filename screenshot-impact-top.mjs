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

for (const id of [7, 13, 8, 10, 3]) {
  await page.click(`.sdg-card[data-id="${id}"]`);
  await new Promise(r => setTimeout(r, 80));
}
await page.click('#sample-btn');
await new Promise(r => setTimeout(r, 200));
await page.click('#generate-btn');
await new Promise(r => setTimeout(r, 600));

// Top of report (action bar + sheet header)
const top = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 820 } });
writeFileSync(join(outDir, 'rpt-new-top.png'), top);
console.log('Saved: rpt-new-top.png');

// Scroll to bottom of report sheet
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 300));
const bot = await page.screenshot({ clip: { x: 0, y: 0, width: 1400, height: 820 } });
writeFileSync(join(outDir, 'rpt-new-bot.png'), bot);
console.log('Saved: rpt-new-bot.png');

await browser.close();
