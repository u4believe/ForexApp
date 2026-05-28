const express = require('express');
const router = express.Router();
const https = require('https');

const SYMBOLS = [
  { yahoo: 'GC=F',      label: 'XAUUSD' },
  { yahoo: 'EURUSD=X',  label: 'EURUSD' },
  { yahoo: 'USDJPY=X',  label: 'USDJPY' },
  { yahoo: 'NVDA',      label: 'NVDA'   },
  { yahoo: 'TSLA',      label: 'TSLA'   },
  { yahoo: 'BTC-USD',   label: 'BTCUSD' },
  { yahoo: 'ETH-USD',   label: 'ETHUSD' },
  { yahoo: '^GSPC',     label: 'SPX'    },
];

const FALLBACK = [
  { symbol: 'XAUUSD',  price: 3320.40,  change:  12.30, pct:  0.37 },
  { symbol: 'EURUSD',  price:  1.1318,  change:  0.0021, pct:  0.19 },
  { symbol: 'USDJPY',  price: 143.52,   change: -0.28,  pct: -0.19 },
  { symbol: 'NVDA',    price: 135.28,   change:  2.84,  pct:  2.14 },
  { symbol: 'TSLA',    price: 339.47,   change: -4.20,  pct: -1.22 },
  { symbol: 'BTCUSD',  price: 108240,   change: 1340.0, pct:  1.25 },
  { symbol: 'ETHUSD',  price: 2540.80,  change:  48.20, pct:  1.93 },
  { symbol: 'SPX',     price: 5912.80,  change:  28.60, pct:  0.49 },
];

let cache = null;
let cacheTs = 0;

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/',
};

// Primary: batch v7 quote API — one request for all symbols
function fetchAllQuotes() {
  return new Promise((resolve, reject) => {
    const symbolList = SYMBOLS.map(s => encodeURIComponent(s.yahoo)).join('%2C');
    const options = {
      hostname: 'query1.finance.yahoo.com',
      path: `/v7/finance/quote?symbols=${symbolList}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`,
      method: 'GET',
      headers: BROWSER_HEADERS,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const json = JSON.parse(Buffer.concat(chunks).toString());
          const results = json?.quoteResponse?.result;
          if (!results || results.length === 0) throw new Error('empty response');

          const prices = SYMBOLS.map((sym, i) => {
            const q = results.find(r => r.symbol === sym.yahoo);
            if (!q || q.regularMarketPrice == null) return FALLBACK[i];
            return {
              symbol: sym.label,
              price:  q.regularMarketPrice,
              change: q.regularMarketChange ?? 0,
              pct:    q.regularMarketChangePercent ?? 0,
            };
          });
          resolve(prices);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// Fallback: per-symbol chart API
function fetchQuoteFallback(sym, index) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(sym.yahoo);
    const options = {
      hostname: 'query2.finance.yahoo.com',
      path: `/v8/finance/chart/${encoded}?interval=1d&range=1d`,
      method: 'GET',
      headers: BROWSER_HEADERS,
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          const json = JSON.parse(Buffer.concat(chunks).toString());
          const meta = json.chart?.result?.[0]?.meta;
          if (!meta || meta.regularMarketPrice == null) throw new Error('no price');
          const price  = meta.regularMarketPrice;
          const prev   = meta.previousClose ?? meta.chartPreviousClose ?? price;
          const change = price - prev;
          const pct    = prev ? (change / prev) * 100 : 0;
          resolve({ symbol: sym.label, price, change, pct });
        } catch { resolve(FALLBACK[index]); }
      });
    });
    req.on('error', () => resolve(FALLBACK[index]));
    req.setTimeout(8000, () => { req.destroy(); resolve(FALLBACK[index]); });
    req.end();
  });
}

router.get('/prices', async (_req, res) => {
  const now = Date.now();
  if (cache && now - cacheTs < 60000) return res.json(cache);

  try {
    let prices;
    try {
      prices = await fetchAllQuotes();
    } catch {
      // Batch endpoint failed — try per-symbol as last resort
      prices = await Promise.all(SYMBOLS.map((sym, i) => fetchQuoteFallback(sym, i)));
    }

    cache = { prices, ts: now };
    cacheTs = now;
    return res.json(cache);
  } catch {
    if (cache) return res.json({ ...cache, stale: true });
    return res.json({ prices: FALLBACK, ts: now, fallback: true });
  }
});

module.exports = router;
