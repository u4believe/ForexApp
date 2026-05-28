const express = require('express');
const router = express.Router();
const https = require('https');

// stooq.com symbols — free, no API key, not IP-blocked
const STOOQ_SYMBOLS = [
  { stooq: 'xauusd',   label: 'XAUUSD' },
  { stooq: 'eurusd',   label: 'EURUSD' },
  { stooq: 'usdjpy',   label: 'USDJPY' },
  { stooq: 'nvda.us',  label: 'NVDA'   },
  { stooq: 'tsla.us',  label: 'TSLA'   },
  { stooq: 'btcusd',   label: 'BTCUSD' },
  { stooq: '%5espx',   label: 'SPX'    }, // ^SPX URL-encoded
];

// Fallback prices (updated to current market levels)
const FALLBACK = [
  { symbol: 'XAUUSD', price: 4419.44, change: -9.00,  pct: -0.20 },
  { symbol: 'EURUSD', price:  1.1614, change:  0.0012, pct:  0.10 },
  { symbol: 'USDJPY', price: 159.58,  change: -0.28,  pct: -0.18 },
  { symbol: 'NVDA',   price: 212.60,  change:  2.84,  pct:  1.34 },
  { symbol: 'TSLA',   price: 440.23,  change: -4.20,  pct: -0.95 },
  { symbol: 'BTCUSD', price: 74288,   change: 800.0,  pct:  1.09 },
  { symbol: 'ETHUSD', price: 2016,    change:  22.5,  pct:  1.13 },
  { symbol: 'SPX',    price: 7520.40, change:  28.60, pct:  0.38 },
];

let cache = null;
let cacheTs = 0;

// Fetch a single symbol from stooq CSV API
function fetchStooq(sym, fallback) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'stooq.com',
      path: `/q/l/?s=${sym.stooq}&f=sd2t2ohlcv&h&e=csv`,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarketBot/1.0)' },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try {
          const lines = raw.trim().split('\n');
          if (lines.length < 2) throw new Error('no data rows');
          const parts = lines[1].split(',');
          // parts: Symbol, Date, Time, Open, High, Low, Close, Volume
          if (!parts[6] || parts[6].trim() === 'N/D') throw new Error('N/D');
          const open  = parseFloat(parts[3]);
          const close = parseFloat(parts[6]);
          if (isNaN(close) || isNaN(open)) throw new Error('parse error');
          const change = close - open;
          const pct    = open !== 0 ? (change / open) * 100 : 0;
          resolve({ symbol: sym.label, price: close, change, pct });
        } catch {
          resolve(fallback);
        }
      });
    });

    req.on('error', () => resolve(fallback));
    req.setTimeout(8000, () => { req.destroy(); resolve(fallback); });
    req.end();
  });
}

// ETH from CoinGecko (stooq ETH symbol is unreliable)
function fetchEth(fallback) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.coingecko.com',
      path: '/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24h_change=true',
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          const eth = json.ethereum;
          if (!eth || eth.usd == null) throw new Error('no data');
          const price = eth.usd;
          const pct   = eth.usd_24h_change ?? 0;
          resolve({ symbol: 'ETHUSD', price, change: price * pct / 100, pct });
        } catch {
          resolve(fallback);
        }
      });
    });

    req.on('error', () => resolve(fallback));
    req.setTimeout(8000, () => { req.destroy(); resolve(fallback); });
    req.end();
  });
}

router.get('/prices', async (_req, res) => {
  const now = Date.now();
  if (cache && now - cacheTs < 60000) return res.json(cache);

  try {
    // Fetch all in parallel
    const [stooqResults, eth] = await Promise.all([
      Promise.all(STOOQ_SYMBOLS.map((sym, i) => fetchStooq(sym, FALLBACK[i < 6 ? i : i + 1]))),
      fetchEth(FALLBACK[6]),
    ]);

    // Merge: insert ETH between BTCUSD (index 5) and SPX (index 6)
    const prices = [
      stooqResults[0], // XAUUSD
      stooqResults[1], // EURUSD
      stooqResults[2], // USDJPY
      stooqResults[3], // NVDA
      stooqResults[4], // TSLA
      stooqResults[5], // BTCUSD
      eth,             // ETHUSD
      stooqResults[6], // SPX
    ];

    cache = { prices, ts: now };
    cacheTs = now;
    return res.json(cache);
  } catch {
    if (cache) return res.json({ ...cache, stale: true });
    return res.json({ prices: FALLBACK, ts: now, fallback: true });
  }
});

module.exports = router;
