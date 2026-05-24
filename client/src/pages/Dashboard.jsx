import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import Overview from '../components/dashboard/Overview';
import Deposit from '../components/dashboard/Deposit';
import Withdraw from '../components/dashboard/Withdraw';
import Investments from '../components/dashboard/Investments';
import Profile from '../components/dashboard/Profile';
import './Dashboard.css';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState({ deposits: [], withdrawals: [], investments: [] });
  const [theme, setTheme] = useState(() => localStorage.getItem('pv_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    api.get('/user/transactions').then(r => setTransactions(r.data)).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('pv_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusBadge = () => {
    const s = user?.verification_status;
    if (s === 'verified') return <span className="badge badge-verified">✓ Verified</span>;
    if (s === 'pending') return <span className="badge badge-pending">⏳ Pending Review</span>;
    if (s === 'rejected') return <span className="badge badge-rejected">✗ Rejected</span>;
    return <span className="badge badge-unverified">○ Unverified</span>;
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: '⬛', exact: true },
    { to: '/dashboard/deposit', label: 'Deposit', icon: '💳' },
    { to: '/dashboard/withdraw', label: 'Withdraw', icon: '↑', locked: user?.verification_status !== 'verified' },
    { to: '/dashboard/investments', label: 'Investments', icon: '📈' },
    { to: '/dashboard/profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="nav-logo" style={{ fontSize: '1.1rem', textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-diamond">◆</span>
            <span>PrimePi <span className="logo-capital">Capital</span></span>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{(user?.full_name || user?.email || '?')[0].toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name || 'Investor'}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          {statusBadge()}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${item.locked ? 'locked' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.locked && <span className="sidebar-lock-badge">Verified only</span>}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <>
              <div style={{ borderTop: '1px solid var(--border-light)', margin: '8px 12px' }} />
              <Link
                to="/admin"
                className="sidebar-link"
                style={{ color: 'var(--gold-500)' }}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon">⚙</span>
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {user?.verification_status === 'pending' && (
          <div className="sidebar-notice">
            <div className="sidebar-notice-icon">⏳</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--warning)', marginBottom: '4px' }}>
                Review In Progress
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-400)', lineHeight: '1.5' }}>
                Your identity is being reviewed. You can still deposit funds. Withdrawals unlock once verified.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', padding: '16px' }}>
          <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout} style={{ justifyContent: 'flex-start' }}>
            ⬡ Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <Link to="/" className="topbar-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-diamond" style={{ color: 'var(--gold-500)' }}>◆</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}>PrimePi</span>
          </Link>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            {statusBadge()}
            <div className="topbar-balance">
              <span style={{ color: 'var(--text-400)', fontSize: '0.78rem' }}>Balance</span>
              <span style={{ fontWeight: 700, color: theme === 'light' ? '#111' : 'var(--gold-300)' }}>${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-content">
          <Routes>
            <Route index element={<Overview user={user} transactions={transactions} />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw user={user} />} />
            <Route path="investments" element={<Investments transactions={transactions} />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
