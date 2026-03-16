import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.mjs':  'text/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};


// ── HTTP server ────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const [urlPath, qs] = req.url.split('?');
  const params = new URLSearchParams(qs || '');

  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── /api/quote?symbols=VOO,SPY,FXAIX ──────────────────────────
  if (urlPath === '/api/quote') {
    const symbols = (params.get('symbols') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!symbols.length) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'no symbols' })); return;
    }
    try {
      const results = await Promise.all(symbols.map(async sym => {
        try {
          const data = await yahooFinance.quoteSummary(sym, {
            modules: ['price', 'summaryDetail', 'fundProfile', 'topHoldings'],
          }, { validateResult: false });
          return { symbol: sym, data };
        } catch (e) {
          console.warn(`quoteSummary(${sym}):`, e.message.slice(0, 80));
          return { symbol: sym, data: null };
        }
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    } catch (e) {
      console.error('/api/quote error:', e.message);
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── /api/chart?symbol=VOO&range=10y ───────────────────────────
  if (urlPath === '/api/chart') {
    const symbol = params.get('symbol');
    const range  = params.get('range') || '10y';
    if (!symbol) {
      res.writeHead(400); res.end(JSON.stringify({ error: 'no symbol' })); return;
    }
    try {
      const rangeYears = parseInt(range) || 10;
      const period1 = new Date();
      period1.setFullYear(period1.getFullYear() - rangeYears);

      const data = await yahooFinance.chart(symbol, {
        period1: period1.toISOString().split('T')[0],
        interval: '1mo',
      }, { validateResult: false });

      // Normalise to the shape compare.html expects
      const closes = (data.quotes || []).map(q => q.adjclose ?? q.close ?? null);
      const out = { chart: { result: [{ indicators: { adjclose: [{ adjclose: closes }] } }] } };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out));
    } catch (e) {
      console.error('/api/chart error:', e.message);
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── Static files ───────────────────────────────────────────────
  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Serving at http://localhost:${PORT}`));
