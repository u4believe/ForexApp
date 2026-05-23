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
  { symbol: 'XAUUSD',  price: 4545.20,  change:  18.30, pct:  0.40 },
  { symbol: 'EURUSD',  price:  1.1631,  change:  0.0042, pct:  0.36 },
  { symbol: 'USDJPY',  price: 158.86,   change: -0.34,  pct: -0.21 },
  { symbol: 'NVDA',    price: 223.47,   change:  4.12,  pct:  1.88 },
  { symbol: 'TSLA',    price: 417.26,   change: -8.40,  pct: -1.97 },
  { symbol: 'BTCUSD',  price: 77455,    change: 1820.0, pct:  2.41 },
  { symbol: 'ETHUSD',  price: 2126.86,  change:  38.50, pct:  1.84 },
  { symbol: 'SPX',     price: 7432.97,  change:  42.10, pct:  0.57 },
];

let cache = null;
let cacheTs = 0;

function fetchQuote(sym) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(sym.yahoo);
    const options = {
      hostname: 'query2.finance.yahoo.com',
      path: `/v8/finance/chart/${encoded}?interval=1d&range=1d`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const meta = json.chart?.result?.[0]?.meta;
          if (!meta || meta.regularMarketPrice == null) throw new Error('no price');
          const price  = meta.regularMarketPrice;
          const prev   = meta.previousClose ?? meta.chartPreviousClose ?? price;
          const change = price - prev;
          const pct    = prev ? (change / prev) * 100 : 0;
          resolve({ symbol: sym.label, price, change, pct });
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function fetchAll() {
  const results = await Promise.all(
    SYMBOLS.map(async (sym, i) => {
      try {
        return await fetchQuote(sym);
      } catch {
        return FALLBACK[i];
      }
    })
  );
  if (results.every((r, i) => r === FALLBACK[i])) throw new Error('all fallback');
  return results;
}

router.get('/prices', async (_req, res) => {
  const now = Date.now();
  if (cache && now - cacheTs < 60000) return res.json(cache);
  try {
    const prices = await fetchAll();
    cache = { prices, ts: now };
    cacheTs = now;
    return res.json(cache);
  } catch {
    if (cache) return res.json({ ...cache, stale: true });
    return res.json({ prices: FALLBACK, ts: now, fallback: true });
  }
});

module.exports = router;
