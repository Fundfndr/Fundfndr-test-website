import puppeteer from 'puppeteer';

const PAGES = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'Screener', url: 'http://localhost:3000/screener.html' },
  { name: 'Portfolio', url: 'http://localhost:3000/portfolio.html' },
  { name: 'Compare', url: 'http://localhost:3000/compare.html' },
  { name: 'Impact Report', url: 'http://localhost:3000/impact-report.html' },
  { name: 'Privacy Policy', url: 'http://localhost:3000/privacy-policy.html' },
  { name: 'Terms of Service', url: 'http://localhost:3000/terms-of-service.html' },
  { name: '404 Page', url: 'http://localhost:3000/404.html' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('\n📋 Console Error Audit\n');
  console.log('═'.repeat(80));

  for (const { name, url } of PAGES) {
    const page = await browser.newPage();
    const errors = [];
    const warnings = [];

    // Capture console messages
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    // Capture uncaught errors
    page.on('error', err => errors.push(`Uncaught Error: ${err.message}`));
    page.on('pageerror', err => errors.push(`Page Error: ${err.message}`));

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Check for favicon
      const favicon = await page.evaluate(() => {
        const link = document.querySelector('link[rel="icon"]');
        return link ? link.getAttribute('href') : null;
      });

      // Check for key elements
      const title = await page.title();
      const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
      const hasFooter = await page.evaluate(() => !!document.querySelector('footer'));

      console.log(`\n✓ ${name}`);
      console.log(`  URL: ${url}`);
      console.log(`  Title: ${title}`);
      console.log(`  Has favicon: ${favicon ? '✓' : '✗'}`);
      console.log(`  Has nav: ${hasNav ? '✓' : '✗'}`);
      console.log(`  Has footer: ${hasFooter ? '✓' : '✗'}`);

      if (errors.length > 0) {
        console.log(`  ⚠️  Errors: ${errors.length}`);
        errors.forEach(err => console.log(`      - ${err.substring(0, 70)}`));
      }

      if (warnings.length > 0 && name === 'Home') {
        console.log(`  ℹ️  Warnings: ${warnings.length}`);
      }
    } catch (err) {
      console.log(`\n✗ ${name} - Failed to load`);
      console.log(`  Error: ${err.message}`);
    }

    await page.close();
  }

  console.log('\n' + '═'.repeat(80));
  console.log('\nTest complete!\n');

  await browser.close();
})();
