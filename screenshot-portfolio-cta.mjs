import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000/portfolio.html', { waitUntil: 'networkidle0' });

// Load sample and scan
await page.click('#loadSample');
await new Promise(r => setTimeout(r, 800));

// Scroll to bottom of results to find the CTA
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 400));

const cta = await page.$('.impact-report-cta');
const shot = await cta.screenshot();
writeFileSync('./temporary screenshots/portfolio-cta.png', shot);
console.log('done');
await browser.close();
