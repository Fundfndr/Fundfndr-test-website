import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';
import Anthropic from '@anthropic-ai/sdk';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHAT_SYSTEM = `You are an AI assistant for FundFndr, a fund comparison platform for ETF and mutual fund investors. You help users navigate the site and answer questions about fund investing.

## Site pages
- / or /index.html — Landing page
- /compare.html — Side-by-side fund comparison dashboard. Users enter ticker symbols (e.g. VOO, SPY, FXAIX) to compare performance charts, expense ratios, holdings, and metrics.
- /etfs.html — Browse and filter ETFs by category, AUM, expense ratio, and returns.
- /mutual-funds.html — Browse mutual funds with similar filters.
- /screener.html — Fund screener to find funds matching specific criteria (return targets, max ER, asset class, etc).

## What you can help with
- Explaining ETF vs mutual fund differences
- Explaining key metrics: expense ratio, AUM, NAV, trailing returns, Sharpe ratio, beta, standard deviation
- Recommending which page to use for a given task
- Answering questions about specific well-known funds (VOO, SPY, QQQ, FXAIX, BND, VTI, SCHD, etc.)
- Explaining how to compare funds side-by-side

## Navigation responses
When a user's intent maps to a page, include a JSON navigation hint at the very end of your response in this exact format (nothing after it):
<nav>{"url":"/compare.html?symbols=VOO,SPY","label":"Open comparison"}</nav>

Only include a <nav> tag when navigation is clearly the right action. Use it for:
- "compare X and Y" → /compare.html?symbols=X,Y
- "find ETFs" or "browse ETFs" → /etfs.html
- "find mutual funds" → /mutual-funds.html
- "screen funds" or "find funds that..." → /screener.html

## Tone
Be concise, knowledgeable, and direct. Investors appreciate precision — don't pad responses. Max 3-4 sentences unless a detailed explanation is needed.`;


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

  // ── /api/chat  (POST, SSE streaming) ─────────────────────────
  if (urlPath === '/api/chat' && req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(); return;
  }
  if (urlPath === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let messages;
      try { ({ messages } = JSON.parse(body)); } catch {
        res.writeHead(400); res.end('bad json'); return;
      }
      if (!process.env.ANTHROPIC_API_KEY) {
        res.writeHead(500); res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' })); return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: CHAT_SYSTEM,
          messages,
        });
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
      } catch (e) {
        res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      }
      res.end();
    });
    return;
  }

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
