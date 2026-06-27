import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000/impact-report.html', { waitUntil: 'networkidle0' });
for (const id of [7, 13, 8, 10, 3]) { await page.click(`.sdg-card[data-id="${id}"]`); await new Promise(r=>setTimeout(r,80)); }
await page.click('#sample-btn');
await new Promise(r=>setTimeout(r,200));
await page.click('#generate-btn');
await new Promise(r=>setTimeout(r,600));
const shot = await page.screenshot({ fullPage: true });
writeFileSync('./temporary screenshots/rpt-full2.png', shot);
const el = await page.$('.rpt-bottom-bar');
const botShot = await el.screenshot();
writeFileSync('./temporary screenshots/rpt-bottom-btn.png', botShot);
console.log('done');
await browser.close();
