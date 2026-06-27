import puppeteer from 'puppeteer';

const THEMES = [
  {
    name: 'green',
    label: 'Forest Green',
    hex: '#2A7D4F',
    vars: {
      '--blue':       '#2A7D4F',
      '--blue-light': '#6BBF8E',
      '--blue-soft':  '#D4EDE1',
    }
  },
  {
    name: 'teal',
    label: 'UN Teal',
    hex: '#009EDB',
    vars: {
      '--blue':       '#009EDB',
      '--blue-light': '#5BC4EE',
      '--blue-soft':  '#CCF0FF',
    }
  }
];

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});

for (const theme of THEMES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Homepage
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
  const cssOverride = Object.entries(theme.vars)
    .map(([k, v]) => `${k}: ${v} !important;`).join(' ');
  await page.addStyleTag({ content: `:root { ${cssOverride} }` });
  await new Promise(r => setTimeout(r, 200));
  const hero = await page.$('.hero');
  await hero.screenshot({ path: `/Users/davidnguyen/Website/temporary screenshots/48-${theme.name}-hero.png` });

  // Nav
  const nav = await page.$('nav');
  await nav.screenshot({ path: `/Users/davidnguyen/Website/temporary screenshots/48-${theme.name}-nav.png` });

  // Screener
  await page.goto('http://localhost:3000/screener.html', { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: `:root { ${cssOverride} }` });

  // Select a few SDG goals to show results
  const cards = await page.$$('.sdg-card');
  await cards[6].click();
  await cards[12].click();
  await new Promise(r => setTimeout(r, 300));
  const results = await page.$('.results-dashboard');
  await results.screenshot({ path: `/Users/davidnguyen/Website/temporary screenshots/48-${theme.name}-screener.png` });

  await page.close();
}

await browser.close();
console.log('done');
