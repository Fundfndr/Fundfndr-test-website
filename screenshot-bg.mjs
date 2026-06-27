import puppeteer from 'puppeteer';
import path from 'path';

const browser = await puppeteer.launch({ headless: 'new' });
const outDir = '/Users/davidnguyen/Website/temporary screenshots';

const themes = [
  {
    name: 'slate',
    label: 'Deep Blue-Slate #0F172A',
    bg: '#0F172A',
    nav: '#0F172A',
    footerBg: '#080E1A',
    blue: '#009EDB',
    blueLight: '#5BC4EE',
    blueSoft: '#CCF0FF',
  },
  {
    name: 'charcoal',
    label: 'Warm Charcoal #1A1F2B',
    bg: '#1A1F2B',
    nav: '#1A1F2B',
    footerBg: '#10141C',
    blue: '#009EDB',
    blueLight: '#5BC4EE',
    blueSoft: '#CCF0FF',
  },
];

// Get current run number
import fs from 'fs';
const files = fs.readdirSync(outDir);
const nums = files.map(f => parseInt(f)).filter(n => !isNaN(n));
const run = (nums.length ? Math.max(...nums) : 0) + 1;

for (const theme of themes) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 700 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  await page.addStyleTag({
    content: `
      :root {
        --bg: ${theme.bg} !important;
        --nav-bg: ${theme.nav} !important;
        --footer-bg: ${theme.footerBg} !important;
        --blue: ${theme.blue} !important;
        --blue-light: ${theme.blueLight} !important;
        --blue-soft: ${theme.blueSoft} !important;
      }
      body { background: ${theme.bg} !important; }
      nav, header { background: ${theme.nav} !important; }
      .hero-section, section:first-of-type { background: ${theme.bg} !important; }
    `
  });

  await new Promise(r => setTimeout(r, 300));
  const heroFile = path.join(outDir, `${run}-${theme.name}-hero.png`);
  await page.screenshot({ path: heroFile, clip: { x: 0, y: 0, width: 1440, height: 700 } });
  console.log(`Saved: ${heroFile}`);
  await page.close();
}

await browser.close();
console.log('Done.');
