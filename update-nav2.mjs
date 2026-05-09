import fs from 'fs';

// New nav HTML per page (active link differs per page)
const navItems = (activePage) => {
  const links = [
    { label: 'Home',          href: 'index.html' },
    { label: 'Browse Funds',  href: 'etfs.html' },
    { label: 'Compare',       href: 'compare.html' },
    { label: 'Impact Finder', href: 'screener.html' },
    { label: 'Portfolio Scan',href: 'portfolio.html' },
    { label: 'Blog',          href: '#' },
  ];
  return links.map(l => {
    const isActive = l.href === activePage;
    return `<li><a href="${l.href}"${isActive ? ' class="active"' : ''}>${l.label}</a></li>`;
  }).join('\n        ');
};

const pages = [
  { file: 'index.html',        active: 'index.html' },
  { file: 'compare.html',      active: 'compare.html' },
  { file: 'etfs.html',         active: 'etfs.html' },
  { file: 'mutual-funds.html', active: 'etfs.html' },   // browse funds = etfs page
  { file: 'screener.html',     active: 'screener.html' },
  { file: 'portfolio.html',    active: 'portfolio.html' },
];

for (const { file, active } of pages) {
  const path = `/Users/davidnguyen/Website/${file}`;
  let html = fs.readFileSync(path, 'utf8');

  // Replace the entire <ul class="nav-links">...</ul> block
  html = html.replace(
    /<ul class="nav-links">[\s\S]*?<\/ul>/,
    `<ul class="nav-links">\n        ${navItems(active)}\n      </ul>`
  );

  // Fix any remaining localhost URLs in nav
  html = html.replace(/href="http:\/\/localhost:3000\/([\w\-\.]+)"/g, 'href="$1"');

  fs.writeFileSync(path, html, 'utf8');
  console.log(`Updated nav in ${file}`);
}

// Update etfs.html page title + h1 + breadcrumb → "Browse Funds"
const etfsPath = '/Users/davidnguyen/Website/etfs.html';
let etfs = fs.readFileSync(etfsPath, 'utf8');
etfs = etfs
  .replace('<title>ETFs — FundFndr</title>', '<title>Browse Funds — FundFndr</title>')
  .replace(/<h1>ETFs<\/h1>/, '<h1>Browse Funds</h1>');
// Fix breadcrumb text
etfs = etfs.replace(/(<div class="breadcrumb">[\s\S]*?<span>)ETFs(<\/span>)/, '$1Browse Funds$2');
fs.writeFileSync(etfsPath, etfs, 'utf8');
console.log('Updated etfs.html page header');

// Update screener.html: "Screener" → "Impact Finder" in title + breadcrumb
const screenerPath = '/Users/davidnguyen/Website/screener.html';
let screener = fs.readFileSync(screenerPath, 'utf8');
screener = screener
  .replace('<title>Impact Screener — FundFndr</title>', '<title>Impact Finder — FundFndr</title>');
// Update breadcrumb span if present
screener = screener.replace(/>Screener<\/span>/, '>Impact Finder</span>');
// Update h1 if it says "Screener" or "Impact Screener"
screener = screener.replace(/(<h1[^>]*>)[^<]*Screener[^<]*(<\/h1>)/, '$1Impact Finder$2');
fs.writeFileSync(screenerPath, screener, 'utf8');
console.log('Updated screener.html labels');

// Update portfolio.html title
const portfolioPath = '/Users/davidnguyen/Website/portfolio.html';
let portfolio = fs.readFileSync(portfolioPath, 'utf8');
portfolio = portfolio.replace(
  '<title>Portfolio Scanner — FundFndr</title>',
  '<title>Portfolio Scan — FundFndr</title>'
);
fs.writeFileSync(portfolioPath, portfolio, 'utf8');
console.log('Updated portfolio.html title');

console.log('\nAll done.');
