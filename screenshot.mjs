import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'temporary screenshots');

const url    = process.argv[2] || 'http://localhost:3000';
const filter = process.argv[3] || '';   // optional: 'nav', 'hero', 'full', etc.

// Sections to capture — selector + friendly label
const SECTIONS = [
  { selector: 'nav',                label: 'nav'        },
  { selector: '.hero',              label: 'hero'       },
  { selector: '.trust-bar',         label: 'trust'      },
  { selector: '.start-section',     label: 'start'      },
  { selector: '.serious-section',   label: 'serious'    },
  { selector: '.features-section',  label: 'features'   },
  { selector: '.templates-section', label: 'categories' },
  { selector: '.bottom-cta',        label: 'cta'        },
  { selector: 'footer',             label: 'footer'     },
];

// Auto-increment: find the next run number
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
const existing = fs.readdirSync(SCREENSHOTS_DIR)
  .filter(f => f.endsWith('.png'))
  .map(f => parseInt(f.match(/^(\d+)-/)?.[1] ?? '0', 10))
  .filter(n => !isNaN(n) && n > 0);
const run = existing.length ? Math.max(...existing) + 1 : 1;

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2' });

const saved = [];

if (filter === 'full') {
  // Full-page fallback
  const outPath = path.join(SCREENSHOTS_DIR, `${run}-full.png`);
  await page.screenshot({ path: outPath, fullPage: true });
  saved.push(outPath);
} else {
  // Determine which sections to capture
  const targets = filter
    ? SECTIONS.filter(s => s.label === filter)
    : SECTIONS;

  for (const { selector, label } of targets) {
    const el = await page.$(selector);
    if (!el) { console.warn(`  ⚠  "${selector}" not found, skipping`); continue; }

    const box = await el.boundingBox();
    if (!box) continue;

    // Add vertical padding so section doesn't feel clipped
    const PAD = 0;
    const clip = {
      x:      Math.max(0, box.x - PAD),
      y:      Math.max(0, box.y - PAD),
      width:  box.width  + PAD * 2,
      height: box.height + PAD * 2,
    };

    const outPath = path.join(SCREENSHOTS_DIR, `${run}-${label}.png`);
    await page.screenshot({ path: outPath, clip });
    saved.push(outPath);
    console.log(`  ✓  ${label.padEnd(14)} → ${path.basename(outPath)}`);
  }
}

await browser.close();
console.log(`\nRun #${run}: ${saved.length} screenshot(s) saved to ./temporary screenshots/`);
