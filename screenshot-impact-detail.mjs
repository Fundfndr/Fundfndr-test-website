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

// Select SDGs
for (const id of [7, 13, 8, 10, 3]) {
  await page.click(`.sdg-card[data-id="${id}"]`);
  await new Promise(r => setTimeout(r, 80));
}
await page.click('#sample-btn');
await new Promise(r => setTimeout(r, 200));
await page.click('#generate-btn');
await new Promise(r => setTimeout(r, 500));

// Screenshot the report sheet directly
const sheet = await page.$('.report-sheet');
const shotFull = await sheet.screenshot();
writeFileSync(join(outDir, 'report-sheet-full.png'), shotFull);
console.log('Saved: report-sheet-full.png');

// Just the header + stats area
const headerEl = await page.$('.rpt-header');
const headerShot = await headerEl.screenshot();
writeFileSync(join(outDir, 'report-header.png'), headerShot);
console.log('Saved: report-header.png');

// Flagged section
const flagSection = await page.$('#section-flagged');
const flagShot = await flagSection.screenshot();
writeFileSync(join(outDir, 'report-flagged.png'), flagShot);
console.log('Saved: report-flagged.png');

// Aligned section
const alignSection = await page.$('#section-aligned');
const alignShot = await alignSection.screenshot();
writeFileSync(join(outDir, 'report-aligned.png'), alignShot);
console.log('Saved: report-aligned.png');

// Coverage section
const covGrid = await page.$('.coverage-grid');
const covShot = await covGrid.screenshot();
writeFileSync(join(outDir, 'report-coverage.png'), covShot);
console.log('Saved: report-coverage.png');

await browser.close();
console.log('Done.');
