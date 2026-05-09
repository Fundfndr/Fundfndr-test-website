import fs from 'fs';

const files = [
  'index.html',
  'screener.html',
  'compare.html',
  'etfs.html',
  'mutual-funds.html',
];

const scrollJS = `
  <script>
    (function() {
      const nav = document.querySelector('nav');
      if (!nav) return;
      function onScroll() {
        nav.classList.toggle('nav-scrolled', window.scrollY > 8);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
  </script>`;

const navScrolledCSS = `
    nav.nav-scrolled {
      border-bottom-color: rgba(255,255,255,0.1);
      box-shadow: 0 4px 32px rgba(0,0,0,0.55);
    }`;

for (const file of files) {
  const path = `/Users/davidnguyen/Website/${file}`;
  let html = fs.readFileSync(path, 'utf8');

  // 1. Nav background → dark
  html = html.replace(
    'background: rgba(250,250,248,0.95);',
    'background: rgba(15,23,42,0.96);'
  );

  // 2. Nav border → subtle white
  // Only replace the first occurrence (inside nav{}) not other border-bottom rules
  html = html.replace(
    /nav \{(\s+position: sticky.*?z-index: 100;\s+background:.*?;\s+backdrop-filter:.*?;\s+)border-bottom: 1px solid var\(--border\);/,
    (m, p1) => `nav {${p1}border-bottom: 1px solid rgba(255,255,255,0.06);`
  );

  // 3. Nav link default color
  html = html.replace(
    /font-size: 13\.5px; font-weight: 400; color: var\(--text-2\);(\s+padding: 6px 12px; border-radius: 6px;)/,
    `font-size: 13.5px; font-weight: 400; color: rgba(255,255,255,0.62);$1`
  );

  // 4. Nav link hover
  html = html.replace(
    '.nav-links a:hover { color: var(--navy); background: rgba(15,23,42,0.05); }',
    '.nav-links a:hover { color: rgba(255,255,255,0.95); background: rgba(255,255,255,0.07); }'
  );

  // 5. Nav link active
  html = html.replace(
    '.nav-links a.active { color: var(--navy); font-weight: 500; background: rgba(15,23,42,0.05); }',
    '.nav-links a.active { color: #fff; font-weight: 500; background: rgba(255,255,255,0.08); }'
  );

  // 6. Login color
  html = html.replace(
    '.nav-login { font-size: 13.5px; color: var(--text-2); padding: 6px 12px; border-radius: 6px; transition: color 0.15s; }',
    '.nav-login { font-size: 13.5px; color: rgba(255,255,255,0.6); padding: 6px 12px; border-radius: 6px; transition: color 0.15s; }'
  );

  // 7. Login hover
  html = html.replace(
    '.nav-login:hover { color: var(--navy); }',
    '.nav-login:hover { color: #fff; }'
  );

  // 8. Add .nav-scrolled CSS after the nav block (after .btn-primary or after nav-login:hover)
  if (!html.includes('nav.nav-scrolled')) {
    html = html.replace(
      '.nav-login:hover { color: #fff; }',
      `.nav-login:hover { color: #fff; }${navScrolledCSS}`
    );
  }

  // 9. Switch logo to white version in nav (not footer)
  html = html.replace(
    /<a href="[^"]*" class="nav-logo">\s*<img src="fundfndr-logo\.svg"/,
    (m) => m.replace('fundfndr-logo.svg', 'fundfndr-logo-white.svg')
  );
  // Also handle index.html which uses index.html as href
  html = html.replace(
    /<a href="index\.html" class="nav-logo">\s*<img src="fundfndr-logo\.svg"/,
    (m) => m.replace('fundfndr-logo.svg', 'fundfndr-logo-white.svg')
  );

  // 10. Add scroll JS before </body>
  if (!html.includes('nav-scrolled')) {
    html = html.replace('</body>', `${scrollJS}\n</body>`);
  } else if (!html.includes('addEventListener(\'scroll\'') && !html.includes('addEventListener("scroll"')) {
    html = html.replace('</body>', `${scrollJS}\n</body>`);
  }

  fs.writeFileSync(path, html, 'utf8');
  console.log(`Updated ${file}`);
}
