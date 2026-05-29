import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import FloatingChat from '../components/FloatingChat';
import './Landing.css';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/* ---- SVG Icons ---- */
const Icons = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

/* ---- Data ---- */
const TICKER_ASSETS = [
  { sym: 'XAUUSD', label: 'XAU/USD', dec: 2 },
  { sym: 'EURUSD', label: 'EUR/USD', dec: 4 },
  { sym: 'USDJPY', label: 'USD/JPY', dec: 2 },
  { sym: 'NVDA',   label: 'NVDA',    dec: 2 },
  { sym: 'TSLA',   label: 'TSLA',    dec: 2 },
  { sym: 'BTCUSD', label: 'BTC/USD', dec: 0 },
  { sym: 'ETHUSD', label: 'ETH/USD', dec: 2 },
  { sym: 'SPX',    label: 'S&P 500', dec: 2 },
];

const TRUST_ITEMS = [
  { Icon: Icons.Award,    title: 'Financial Commission', sub: 'Licensed Member' },
  { Icon: Icons.Lock,     title: '256-bit SSL',          sub: 'Bank-grade Encryption' },
  { Icon: Icons.Shield,   title: 'Segregated Accounts',  sub: 'Client Funds Protected' },
  { Icon: Icons.CheckCircle, title: 'KYC/AML Compliant', sub: '40+ Countries Served' },
];

const ACTIVITY_ITEMS = [
  { name: 'James M.',   flag: '🇬🇧', city: 'London',      plan: 'Premium', amount: '$14,200' },
  { name: 'Priya K.',   flag: '🇸🇬', city: 'Singapore',   plan: 'Growth',  amount: '$3,500'  },
  { name: 'Marcus L.',  flag: '🇺🇸', city: 'New York',    plan: 'Elite',   amount: '$62,000' },
  { name: 'Adaeze O.',  flag: '🇳🇬', city: 'Lagos',       plan: 'Growth',  amount: '$2,800'  },
  { name: 'Chen W.',    flag: '🇨🇳', city: 'Shanghai',    plan: 'Premium', amount: '$18,500' },
  { name: 'Sophie R.',  flag: '🇫🇷', city: 'Paris',       plan: 'Starter', amount: '$750'    },
  { name: 'Olumide A.', flag: '🇳🇬', city: 'Abuja',       plan: 'Growth',  amount: '$4,100'  },
  { name: 'David K.',   flag: '🇰🇪', city: 'Nairobi',     plan: 'Starter', amount: '$500'    },
  { name: 'Maria G.',   flag: '🇧🇷', city: 'São Paulo',   plan: 'Growth',  amount: '$5,200'  },
  { name: 'Thomas F.',  flag: '🇩🇪', city: 'Frankfurt',   plan: 'Elite',   amount: '$85,000' },
  { name: 'Amara N.',   flag: '🇬🇭', city: 'Accra',       plan: 'Starter', amount: '$300'    },
  { name: 'Raj P.',     flag: '🇮🇳', city: 'Mumbai',      plan: 'Premium', amount: '$22,000' },
  { name: 'Yuki T.',    flag: '🇯🇵', city: 'Tokyo',       plan: 'Growth',  amount: '$6,800'  },
  { name: 'Fatima A.',  flag: '🇦🇪', city: 'Dubai',       plan: 'Elite',   amount: '$110,000'},
  { name: 'Carlos R.',  flag: '🇲🇽', city: 'Mexico City', plan: 'Growth',  amount: '$4,600'  },
];

const PLANS = [
  { name: 'Starter', min: 100,   max: 1000,  roi: '7–15%', fee: '20%', highlight: false },
  { name: 'Growth',  min: 1100,  max: 10000, roi: '7–15%', fee: '15%', highlight: true  },
  { name: 'Premium', min: 10100, max: 50000, roi: '7–15%', fee: '10%', highlight: false },
  { name: 'Elite',   min: 50100, max: null,  roi: '7–15%', fee: '5%',  highlight: false },
];

const FEATURES = [
  { Icon: Icons.Shield,     title: 'Asset Protection',    desc: 'All client funds are held in segregated accounts with multi-layered security protocols and independent custodial oversight.' },
  { Icon: Icons.TrendingUp, title: 'Consistent Returns',  desc: 'Our proprietary trading algorithms deliver stable bi-weekly returns of 7–15% regardless of market volatility.' },
  { Icon: Icons.Clock,      title: 'Bi-Weekly Payouts',   desc: 'Returns are credited to your account every 14 days. No lock-in periods — request a withdrawal at any time after verification.' },
  { Icon: Icons.Globe,      title: 'Global Accessibility', desc: 'Available to investors in 40+ countries. Deposit and withdraw using major cryptocurrencies around the clock.' },
  { Icon: Icons.Lock,       title: 'Bank-Grade Security', desc: '256-bit SSL encryption, two-factor authentication, and identity verification for every account.' },
  { Icon: Icons.BarChart,   title: 'Full Transparency',   desc: 'Detailed transaction history, cycle-by-cycle return reports, and real-time portfolio visibility in your dashboard.' },
];

const STEPS = [
  { n: '01', title: 'Create Your Account',  desc: "Register with your email address. You'll receive a verification link immediately." },
  { n: '02', title: 'Complete Verification', desc: 'Submit your identity documents for KYC compliance. Typically reviewed within 1–2 business days.' },
  { n: '03', title: 'Fund Your Account',    desc: 'Deposit via Bitcoin, Litecoin, or USDT. Funds are credited after network confirmation.' },
  { n: '04', title: 'Earn Bi-Weekly',       desc: 'Your capital is actively managed. Returns of 7–15% are credited to your account every two weeks.' },
];

const TESTIMONIALS = [
  { quote: 'I moved a portion of my savings to CapitalPip 14 months ago. The returns have been consistent every cycle and the dashboard gives complete visibility into every transaction.', name: 'Michael T.', title: 'Portfolio Manager',    location: 'London, UK',          plan: 'Premium Plan' },
  { quote: 'The KYC process was thorough, which actually gave me more confidence in the platform. After verification, my first payout arrived exactly on schedule.',                        name: 'Adaeze O.',   title: 'Business Consultant', location: 'Lagos, Nigeria',       plan: 'Growth Plan'  },
  { quote: "I've used other crypto investment platforms and the difference with CapitalPip is the professionalism. Withdrawals are processed promptly and support is always available.",    name: 'Carlos R.',   title: 'Software Engineer',   location: 'Mexico City, Mexico',  plan: 'Elite Plan'   },
];

const FAQS = [
  { q: 'What is the minimum investment amount?',      a: 'The minimum investment starts at $100 under our Starter plan. Higher tiers begin at $1,100 (Growth), $10,100 (Premium), and $50,100 (Elite), each offering progressively lower profit fees.' },
  { q: 'How and when are returns paid?',              a: 'Returns of 7–15% are credited to your account dashboard balance every 14 days (bi-weekly). The exact rate within this range depends on market conditions during each cycle.' },
  { q: 'What is the profit fee?',                    a: 'The profit fee is a performance-based charge deducted from your earnings only — never your principal. Fees range from 5% (Elite) to 20% (Starter), incentivising larger investments.' },
  { q: 'How do I withdraw my funds?',                a: 'Once your account is fully verified (KYC approved), you can submit withdrawal requests from your dashboard at any time. Withdrawals are processed within 24–48 business hours.' },
  { q: 'Which cryptocurrencies are accepted?',       a: 'We accept Bitcoin (BTC), Litecoin (LTC), and USDT via both the Tron (TRC20) and Ethereum (ERC20) networks.' },
  { q: 'How long does identity verification take?',  a: 'Most KYC reviews are completed within 1–2 business days. You will be notified via email once your account status is updated. You may deposit funds during this period.' },
];


/* ---- Market Ticker (CSS scrolling animation) ---- */
function MarketTicker() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/market/prices`);
      if (!res.ok) throw new Error('api');
      const data = await res.json();
      if (data.prices?.length) setPrices(data.prices);
    } catch { /* keep stale/fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  const fmt = (price, dec) => {
    if (price == null) return '—';
    return price.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

  const renderSet = (suffix) => loading
    ? TICKER_ASSETS.map((a) => (
        <div className="ticker-item" key={`${a.sym}${suffix}`}>
          <span className="ticker-symbol">{a.label}</span>
          <span className="ticker-skeleton" />
        </div>
      ))
    : prices.map((p, i) => {
        const meta = TICKER_ASSETS[i] || { dec: 2, label: p.symbol };
        const up = (p.pct ?? 0) >= 0;
        return (
          <div className="ticker-item" key={`${p.symbol}${suffix}`}>
            <span className="ticker-symbol">{meta.label}</span>
            <span className="ticker-price">{fmt(p.price, meta.dec)}</span>
            <span className={`ticker-change ${up ? 'up' : 'down'}`}>
              {up ? '▲' : '▼'} {Math.abs(p.pct ?? 0).toFixed(2)}%
            </span>
          </div>
        );
      });

  return (
    <div className="market-ticker">
      <div className="ticker-live-badge">
        <span className="ticker-dot" />
        LIVE
      </div>
      <div className="ticker-outer">
        <div className="ticker-track">
          {renderSet('-a')}
          {renderSet('-b')}
        </div>
      </div>
    </div>
  );
}

/* ---- Live Activity Feed ---- */
function LiveActivityFeed() {
  const [visible, setVisible] = useState(ACTIVITY_ITEMS.slice(0, 5));
  const idxRef = useRef(5);

  useEffect(() => {
    const id = setInterval(() => {
      const next = ACTIVITY_ITEMS[idxRef.current % ACTIVITY_ITEMS.length];
      idxRef.current++;
      setVisible(prev => [next, ...prev.slice(0, 4)]);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <span className="ticker-dot" style={{ width: 8, height: 8 }} />
        Live Investment Activity
      </div>
      {visible.map((item, i) => (
        <div className={`activity-item ${i === 0 ? 'activity-item-new' : ''}`} key={`${item.name}-${i}`}>
          <div className="activity-avatar">{item.name[0]}</div>
          <div className="activity-body">
            <div className="activity-name-row">
              <span className="activity-name">{item.name}</span>
              <span className="activity-flag">{item.flag}</span>
              <span className="activity-city">{item.city}</span>
            </div>
            <div className="activity-detail">
              invested <strong>{item.amount}</strong> · <span className="activity-plan">{item.plan} Plan</span>
            </div>
          </div>
          <div className="activity-time">{i === 0 ? 'just now' : `${(i + 1) * 4}m ago`}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- Trading Panel (hero widget) ---- */
const TP_ASSETS = [
  { sym: 'XAUUSD', label: 'XAU/USD', dec: 2,  spread: 0.50 },
  { sym: 'BTCUSD', label: 'BTC/USD', dec: 0,  spread: 15   },
  { sym: 'EURUSD', label: 'EUR/USD', dec: 4,  spread: 0.0002 },
  { sym: 'SPX',    label: 'S&P 500', dec: 2,  spread: 0.50 },
];

/* Pre-drawn chart paths — each an uptrending trace with realistic noise */
const TP_CHARTS = [
  // XAU/USD
  [[0,75],[17,70],[34,65],[51,69],[68,58],[85,62],[102,51],[119,55],[136,44],[153,49],[170,37],[187,43],[204,30],[221,35],[238,24],[255,29],[272,18],[289,23],[306,12],[323,17],[340,10]],
  // BTC/USD
  [[0,72],[15,60],[30,74],[45,54],[60,68],[75,44],[90,54],[105,38],[120,50],[135,32],[150,44],[165,27],[180,40],[195,24],[210,36],[225,18],[240,30],[255,14],[270,26],[285,11],[300,22],[320,14],[340,18]],
  // EUR/USD
  [[0,72],[25,68],[50,66],[75,70],[100,62],[125,66],[150,60],[175,64],[200,56],[225,60],[250,52],[275,56],[300,48],[325,52],[340,46]],
  // S&P 500
  [[0,70],[20,66],[40,62],[60,65],[80,56],[100,60],[120,51],[140,54],[160,46],[180,49],[200,41],[220,44],[240,37],[260,40],[280,31],[300,34],[320,26],[340,22]],
];

const AUTO_DELAY = 5000;

function TradingPanel() {
  const [prices, setPrices] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const autoRef = useRef(null);

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % TP_ASSETS.length);
    }, AUTO_DELAY);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, [startAuto]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/market/prices`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.prices?.length) setPrices(d.prices);
      } catch {}
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const asset = TP_ASSETS[activeIdx];
  const data  = prices?.find(p => p.symbol === asset.sym);
  const up    = (data?.pct ?? 0) >= 0;

  const fmt = (val, dec) => {
    if (val == null) return '—';
    return val.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

  const pts      = TP_CHARTS[activeIdx];
  const lastPt   = pts[pts.length - 1];
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area     = `M ${pts.map(([x, y]) => `${x},${y}`).join(' L ')} L ${lastPt[0]},110 L 0,110 Z`;
  const lineColor = up ? '#C9A84C' : '#ef4444';

  const bid = data ? data.price - asset.spread : null;
  const ask = data ? data.price + asset.spread : null;

  return (
    <div className="tp-panel">
      {/* Instrument tabs */}
      <div className="tp-tabs">
        {TP_ASSETS.map((a, i) => (
          <button key={a.sym} className={`tp-tab ${i === activeIdx ? 'tp-tab-active' : ''}`}
            onClick={() => { setActiveIdx(i); startAuto(); }}>
            {a.label}
            {i === activeIdx && <span className="tp-tab-bar" key={activeIdx} />}
          </button>
        ))}
      </div>

      {/* Animated body: price + chart */}
      <div className="tp-body" key={activeIdx}>

      {/* Price headline */}
      <div className="tp-headline">
        <div>
          <div className="tp-price">
            {data ? fmt(data.price, asset.dec) : <span className="tp-skel" />}
          </div>
          {data && (
            <div className={`tp-pct ${up ? 'tp-green' : 'tp-red'}`}>
              {up ? '▲' : '▼'} {Math.abs(data.pct).toFixed(2)}%
              <span className="tp-abs">&nbsp;{up ? '+' : ''}{fmt(data.change, asset.dec)}</span>
            </div>
          )}
        </div>
        <div className="tp-live">
          <span className="tp-live-dot" />
          LIVE
        </div>
      </div>

      {/* Chart */}
      <div className="tp-chart">
        <svg viewBox="0 0 340 110" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 100 }}>
          <defs>
            <linearGradient id={`tpg${activeIdx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[28, 56, 84].map(y => (
            <line key={y} x1="0" y1={y} x2="340" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}
          <path d={area} fill={`url(#tpg${activeIdx})`} />
          <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={lastPt[0]} cy={lastPt[1]} r="7" fill={lineColor} opacity="0.2" className="tp-pulse-ring" />
          <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={lineColor} />
        </svg>
      </div>

      </div>{/* end tp-body */}

      {/* Bid / Ask spread */}
      {data && (
        <div className="tp-spread">
          <div className="tp-side">
            <span className="tp-side-lbl tp-bid-lbl">BID</span>
            <span className="tp-side-val">{fmt(bid, asset.dec)}</span>
          </div>
          <div className="tp-spread-center">
            <div className="tp-spread-line" />
            <span className="tp-spread-lbl">SPREAD</span>
            <div className="tp-spread-line" />
          </div>
          <div className="tp-side tp-ask-side">
            <span className="tp-side-lbl tp-ask-lbl">ASK</span>
            <span className="tp-side-val">{fmt(ask, asset.dec)}</span>
          </div>
        </div>
      )}

      {/* Mini rows for other assets */}
      <div className="tp-mini-list">
        {TP_ASSETS.filter((_, i) => i !== activeIdx).map(a => {
          const d = prices?.find(p => p.symbol === a.sym);
          const u = (d?.pct ?? 0) >= 0;
          return (
            <button key={a.sym} className="tp-mini-row" onClick={() => { setActiveIdx(TP_ASSETS.indexOf(a)); startAuto(); }}>
              <span className="tp-mini-sym">{a.label}</span>
              <span className="tp-mini-price">{d ? fmt(d.price, a.dec) : '—'}</span>
              <span className={`tp-mini-pct ${u ? 'tp-green' : 'tp-red'}`}>
                {u ? '+' : ''}{(d?.pct ?? 0).toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- FAQ Item ---- */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className={`faq-icon ${open ? 'faq-icon-open' : ''}`}><Icons.ChevronDown /></span>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

/* ---- Page ---- */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('pv_theme') || 'light');
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('pv_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  const open = (m) => { setModal(m); setMenuOpen(false); };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <div className="lp-wrap">

      {/* ── Navbar ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="container lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-gem">◆</span>
            CapitalPip <span className="lp-logo-cap">Markets</span>
          </div>

          <ul className="lp-nav-links">
            <li><button onClick={() => scrollTo('about')}>About</button></li>
            <li><button onClick={() => scrollTo('plans')}>Plans</button></li>
            <li><button onClick={() => scrollTo('markets')}>Markets</button></li>
            <li><button onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
            <li><button onClick={() => scrollTo('faq')}>FAQ</button></li>
          </ul>

          <div className="lp-nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>
            {user ? (
              <button className="btn btn-gold btn-sm" onClick={() => navigate('/dashboard')}>Dashboard →</button>
            ) : (
              <>
                <button className="btn btn-outline btn-sm" onClick={() => open('login')}>Sign In</button>
                <button className="btn btn-gold btn-sm" onClick={() => open('register')}>Open Account</button>
              </>
            )}
          </div>

          <div className="lp-nav-mobile-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>
            <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lp-mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="lp-mobile-auth">
            <button className="btn btn-gold btn-full btn-lg" onClick={() => open('register')}>Open Investment Account</button>
            <button className="btn btn-outline btn-full" onClick={() => open('login')}>Sign In to Existing Account</button>
          </div>
          <nav className="lp-mobile-links">
            <button onClick={() => scrollTo('about')}>About Us</button>
            <button onClick={() => scrollTo('plans')}>Investment Plans</button>
            <button onClick={() => scrollTo('markets')}>Live Markets</button>
            <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
          </nav>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="container lp-hero-inner">
          <div className="lp-hero-content">
            <div className="section-tag">Professional Investment Management</div>
            <h1 className="lp-hero-h1">
              Your Capital,<br />
              <span className="gold-text">Actively Managed</span><br />
              For Maximum Returns
            </h1>
            <p className="lp-hero-sub">
              Earn <strong>7–15% bi-weekly returns</strong> across Forex, Crypto & Equity markets —
              fully managed by our expert trading team. Transparent, secure, and consistently profitable.
            </p>
            <div className="lp-hero-cta">
              <button className="btn btn-gold btn-lg" onClick={() => open('register')}>Open Account</button>
              <button className="btn btn-outline btn-lg" onClick={() => open('login')}>Sign In</button>
            </div>
            <div className="lp-hero-trust">
              <span><Icons.Lock /> 256-bit SSL</span>
              <span><Icons.Shield /> KYC Verified</span>
              <span><Icons.Globe /> 40+ Countries</span>
            </div>
          </div>
          <div className="lp-hero-widget-wrap">
            <TradingPanel />
          </div>
        </div>

      </section>

      {/* Mobile sticky CTA — fixed at bottom, only shown after scrolling past hero */}
      <div className={`lp-mobile-cta${pastHero ? ' lp-mobile-cta--visible' : ''}`}>
        <button className="btn btn-gold btn-full btn-lg" onClick={() => open('register')}>Open Account</button>
        <button className="btn btn-outline btn-full" onClick={() => open('login')}>Already a member? Sign In</button>
      </div>

      {/* ── Market Ticker (scrolling strip, after hero) ── */}
      <MarketTicker />

      {/* ── Trust Strip ── */}
      <div className="trust-strip">
        <div className="container">
          <div className="trust-badges">
            {TRUST_ITEMS.map((b, i) => (
              <div className="trust-badge" key={i}>
                <div className="trust-badge-icon"><b.Icon /></div>
                <div>
                  <div className="trust-badge-title">{b.title}</div>
                  <div className="trust-badge-sub">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="lp-stats">
        <div className="container">
          <div className="lp-stats-block fade-up">
            <div className="lp-stats-grid">
              {[
                { val: '$94.2M', label: 'Assets Under Management' },
                { val: '12,847', label: 'Registered Investors' },
                { val: '$8.31M', label: 'Total Returns Paid' },
                { val: '54 months', label: 'Operating History' },
              ].map((s, i) => (
                <div className="lp-stat" key={i}>
                  <div className="lp-stat-val">{s.val}</div>
                  <div className="lp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="lp-section" id="about">
        <div className="container">
          <div className="lp-about-grid fade-up">
            <div>
              <div className="section-tag">Who We Are</div>
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                A Regulated Investment Firm Built for the Digital Age
              </h2>
              <p className="lp-about-text">
                CapitalPip Markets is a professional investment management firm with over 54 months
                of verified operating history. We manage over $94 million in client assets across
                Forex, Cryptocurrency and Equity markets — delivering consistent bi-weekly returns
                through disciplined, algorithm-assisted portfolio management.
              </p>
              <p className="lp-about-text">
                Our operations are underpinned by strict KYC/AML compliance, segregated client
                accounts, and multi-tier security infrastructure — ensuring every investor's
                capital and personal data is protected to the highest standard.
              </p>
              <div className="lp-about-points">
                {[
                  'Fully KYC/AML compliant with rigorous identity verification',
                  'Segregated client accounts — your funds are never commingled',
                  'Proprietary risk management framework across all portfolios',
                  'Dedicated account managers for Premium and Elite investors',
                ].map((p, i) => (
                  <div className="lp-about-point" key={i}>
                    <span className="lp-check"><Icons.CheckCircle /></span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-about-metrics">
              {[
                { label: 'Strategy Win Rate',     val: 94,  note: 'of trading cycles profitable' },
                { label: 'On-Time Payout Rate',   val: 100, note: 'all payouts delivered on schedule' },
                { label: 'Client Retention Rate', val: 97,  note: 'of investors renew each cycle' },
              ].map((m, i) => (
                <div className="lp-metric-card" key={i}>
                  <div className="lp-metric-row">
                    <span className="lp-metric-label">{m.label}</span>
                    <span className="lp-metric-pct gold-text">{m.val}%</span>
                  </div>
                  <div className="lp-metric-track">
                    <div className="lp-metric-fill" style={{ width: `${m.val}%` }} />
                  </div>
                  <div className="lp-metric-note">{m.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Markets ── */}
      <section className="lp-section lp-section-alt" id="markets">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-tag">Live Markets</div>
            <h2 className="section-title">Real-Time Market Data</h2>
            <p className="section-subtitle">
              Our strategies span Forex, Precious Metals, Equities and Cryptocurrencies — the same
              instruments powering your bi-weekly returns.
            </p>
          </div>
          <div className="markets-grid">
            {TICKER_ASSETS.map((a, i) => (
              <MarketCard key={a.sym} asset={a} idx={i} />
            ))}
          </div>
          <div className="activity-section-inner">
            <LiveActivityFeed />
            <div className="activity-stats-col">
              {[
                { num: '127',  label: 'New investors today' },
                { num: '$2.4M', label: 'Deposited today' },
                { num: '98%',  label: 'Satisfaction rate' },
                { num: '24/7', label: 'Expert support' },
              ].map((s, i) => (
                <div className="activity-stat-card" key={i}>
                  <div className="activity-stat-num">{s.num}</div>
                  <div className="activity-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="lp-section" id="plans">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-tag">Investment Plans</div>
            <h2 className="section-title">Four Tiers. One Consistent Strategy.</h2>
            <p className="section-subtitle">
              Every plan runs on the same proven bi-weekly model. Your tier determines your
              deposit range and the profit fee structure — the higher your investment, the lower your fee.
            </p>
          </div>
          <div className="lp-plans-grid">
            {PLANS.map((plan) => (
              <div className={`lp-plan-card ${plan.highlight ? 'lp-plan-highlight' : ''}`} key={plan.name}>
                {plan.highlight && <div className="lp-plan-badge">Most Popular</div>}
                <div className="lp-plan-name">{plan.name}</div>
                <div className="lp-plan-range">
                  ${plan.min.toLocaleString()} – {plan.max ? `$${plan.max.toLocaleString()}` : 'Unlimited'}
                </div>
                <div className="lp-plan-roi-wrap">
                  <div className="lp-plan-roi">{plan.roi}%</div>
                  <div className="lp-plan-roi-period">Bi-Weekly ROI</div>
                </div>
                <div className="lp-plan-sep" />
                <ul className="lp-plan-features">
                  <li><Icons.CheckCircle /> Bi-weekly return: <strong>{plan.roi}%</strong></li>
                  <li><Icons.CheckCircle /> Profit fee: <strong>{plan.fee} on earnings</strong></li>
                  <li><Icons.CheckCircle /> 24/7 dashboard access</li>
                  <li><Icons.CheckCircle /> Crypto deposits &amp; withdrawals</li>
                  {plan.name === 'Elite'   && <li><Icons.CheckCircle /> Dedicated relationship manager</li>}
                  {plan.name === 'Premium' && <li><Icons.CheckCircle /> Priority support queue</li>}
                </ul>
                <button
                  className={`btn btn-full ${plan.highlight ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => open('register')}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
          <p className="lp-plans-note">
            All plans include full identity verification, segregated account custody, and bi-weekly
            return reporting. Profit fees are deducted from earnings only — your principal is never affected.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-section lp-section-alt" id="how-it-works">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-tag">Getting Started</div>
            <h2 className="section-title">From Registration to Returns in 4 Steps</h2>
            <p className="section-subtitle">
              Our onboarding is thorough by design — identity verification protects every investor on the platform.
            </p>
          </div>
          <div className="lp-steps">
            {STEPS.map((step, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-num">{step.n}</div>
                <div className="lp-step-body">
                  <h3 className="lp-step-title">{step.title}</h3>
                  <p className="lp-step-desc">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className="lp-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-section">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-tag">Platform Advantages</div>
            <h2 className="section-title">Built to the Standard Investors Deserve</h2>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div className="lp-feature-card" key={i}>
                <div className="lp-feature-icon"><f.Icon /></div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-section lp-section-alt">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-tag">Investor Experiences</div>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          <div className="lp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="lp-testimonial" key={i}>
                <div className="lp-testimonial-body">
                  <div className="lp-quote-mark">"</div>
                  <p className="lp-testimonial-text">{t.quote}</p>
                </div>
                <div className="lp-testimonial-author">
                  <div className="lp-author-avatar">{t.name[0]}</div>
                  <div>
                    <div className="lp-author-name">{t.name}</div>
                    <div className="lp-author-meta">{t.title} · {t.location}</div>
                    <div className="lp-author-plan">{t.plan}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="lp-cta-banner">
        <div className="container lp-cta-inner">
          <h2 className="lp-cta-title">Ready to Put Your Capital to Work?</h2>
          <p className="lp-cta-sub">
            Join 12,847 investors already earning consistent bi-weekly returns.
            Account setup takes less than five minutes.
          </p>
          <div className="lp-cta-btns">
            <button className="btn btn-gold btn-lg" onClick={() => open('register')}>Open Account</button>
            <button className="btn btn-outline btn-lg" onClick={() => open('login')}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section" id="faq">
        <div className="container">
          <div className="section-header fade-up">
            <div className="section-tag">FAQ</div>
            <h2 className="section-title">Common Questions</h2>
          </div>
          <div className="lp-faq-list">
            {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-logo" style={{ marginBottom: 10 }}>
                <span className="lp-logo-gem">◆</span>
                CapitalPip <span className="lp-logo-cap">Markets</span>
              </div>
              <p className="lp-footer-tagline">Where Smart Money Grows</p>
              <p className="lp-footer-desc">
                Professional multi-asset investment management. Consistent bi-weekly returns,
                full transparency, and bank-grade security across 40+ countries.
              </p>
              <div className="lp-footer-crypto">
                <span title="Bitcoin">₿</span>
                <span title="Ethereum">Ξ</span>
                <span title="Litecoin">Ł</span>
                <span title="Tether">₮</span>
              </div>
            </div>
            <div className="lp-footer-cols">
              <div className="lp-footer-col">
                <h4>Platform</h4>
                <ul>
                  <li><button onClick={() => open('register')}>Open Account</button></li>
                  <li><button onClick={() => open('login')}>Sign In</button></li>
                  <li><button onClick={() => scrollTo('plans')}>Investment Plans</button></li>
                  <li><button onClick={() => scrollTo('markets')}>Live Markets</button></li>
                </ul>
              </div>
              <div className="lp-footer-col">
                <h4>Company</h4>
                <ul>
                  <li><button onClick={() => scrollTo('about')}>About Us</button></li>
                  <li><button onClick={() => scrollTo('how-it-works')}>How It Works</button></li>
                  <li><button onClick={() => scrollTo('faq')}>FAQ</button></li>
                </ul>
              </div>
              <div className="lp-footer-col">
                <h4>Legal</h4>
                <ul>
                  <li><a href="/legal/privacy-policy">Privacy Policy</a></li>
                  <li><a href="/legal/terms-of-service">Terms of Service</a></li>
                  <li><a href="/legal/risk-disclosure">Risk Disclosure</a></li>
                  <li><a href="/legal/aml-policy">AML Policy</a></li>
                </ul>
              </div>
              <div className="lp-footer-col">
                <h4>Support</h4>
                <ul>
                  <li><a href="mailto:support.capitalpip@gmail.com">support.capitalpip@gmail.com</a></li>
                  <li>
                    <a href="https://wa.me/17578324485" target="_blank" rel="noopener noreferrer">
                      WhatsApp: +1 (757) 832-4485
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="lp-footer-reg">
            <span>Financial Commission · Member No. 2013-09-0001</span>
            <span className="lp-footer-reg-sep">|</span>
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="lp-footer-bottom">
            <p>© 2025 CapitalPip Markets. All rights reserved.</p>
            <p className="lp-footer-risk">
              Risk Disclosure: Investment in financial instruments involves substantial risk and may not be suitable for all investors.
              Past performance does not guarantee future results. Please invest only what you can afford to lose.
            </p>
          </div>
        </div>
      </footer>

      {modal && (
        <AuthModal mode={modal} onClose={() => setModal(null)} onSwitch={(m) => setModal(m)} />
      )}

      <FloatingChat />
    </div>
  );
}

/* ---- Market Card (used in Live Markets section) ---- */
function MarketCard({ asset, idx }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/market/prices`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.prices?.[idx]) setData(json.prices[idx]);
      } catch { /* noop */ }
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [idx]);

  const fmt = (price) => {
    if (price == null) return '—';
    return price.toLocaleString('en-US', {
      minimumFractionDigits: asset.dec,
      maximumFractionDigits: asset.dec,
    });
  };

  const up = data ? (data.pct ?? 0) >= 0 : true;

  return (
    <div className="market-card">
      <div className="market-card-top">
        <span className="market-card-symbol">{asset.label}</span>
        {data && (
          <span className={`market-card-change ${up ? 'up' : 'down'}`}>
            {up ? '▲' : '▼'} {Math.abs(data.pct ?? 0).toFixed(2)}%
          </span>
        )}
      </div>
      <div className="market-card-price">
        {data ? fmt(data.price) : <span className="market-card-skeleton" />}
      </div>
      {data && (
        <div className={`market-card-abs ${up ? 'up' : 'down'}`}>
          {up ? '+' : ''}{(data.change ?? 0).toLocaleString('en-US', { minimumFractionDigits: asset.dec > 2 ? asset.dec : 2, maximumFractionDigits: asset.dec > 2 ? asset.dec : 2 })}
        </div>
      )}
    </div>
  );
}
