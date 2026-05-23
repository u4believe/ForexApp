import { useState } from 'react';
import api from '../../api';

const CRYPTOS = ['BTC', 'LTC', 'USDT (TRC20)', 'USDT (ERC20)', 'ETH', 'BNB'];

export default function Withdraw({ user }) {
  const [form, setForm] = useState({ amount: '', wallet_address: '', crypto: 'BTC' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  if (user?.verification_status !== 'verified') {
    return (
      <div>
        <h1 className="dash-page-title">Withdraw Funds</h1>
        <p className="dash-page-sub">Request a withdrawal to your crypto wallet</p>
        <div style={{
          background: 'var(--section-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '60px 40px', maxWidth: '480px', margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '12px' }}>
            Verification Required
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '24px' }}>
            {user?.verification_status === 'pending'
              ? 'Your account is currently under review. Withdrawals will be enabled once your identity is verified by our team.'
              : 'You must complete identity verification (KYC) before making withdrawals. This typically takes 1–2 business days.'}
          </p>
          <div className={`badge ${user?.verification_status === 'pending' ? 'badge-pending' : 'badge-unverified'}`}
            style={{ fontSize: '0.88rem', padding: '8px 18px' }}>
            {user?.verification_status === 'pending' ? '⏳ Pending Review' : '○ Unverified'}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (!form.wallet_address.trim()) { setError('Please enter your wallet address'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/user/withdraw', {
        amount: parseFloat(form.amount),
        wallet_address: form.wallet_address.trim(),
        crypto: form.crypto,
      });
      setSuccess('Your withdrawal request has been submitted. Processing within 24–48 hours.');
      setForm({ amount: '', wallet_address: '', crypto: 'BTC' });
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="dash-page-title">Withdraw Funds</h1>
      <p className="dash-page-sub">Request a withdrawal to your cryptocurrency wallet</p>

      {success && <div className="alert alert-success" style={{ marginBottom: '24px' }}>✓ {success}</div>}

      <div style={{ maxWidth: '520px' }}>
        <div style={{
          background: 'var(--success-bg)', border: '1px solid var(--success-border)',
          borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ color: 'var(--success)' }}>✓</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
            <strong>Verified Account</strong> — Withdrawals are enabled on your account.
          </span>
        </div>

        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <div className="dash-stat-label" style={{ marginBottom: '4px' }}>Available Balance</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: 'var(--gold-600)' }}>
              ${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Withdrawal Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  className="form-input"
                  placeholder="Minimum $10.00"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  required
                />
                <span className="form-hint">Minimum withdrawal: $10.00</span>
              </div>

              <div className="form-group">
                <label className="form-label">Cryptocurrency</label>
                <select
                  className="form-input"
                  value={form.crypto}
                  onChange={(e) => set('crypto', e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {CRYPTOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Wallet Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Your ${form.crypto} wallet address`}
                  value={form.wallet_address}
                  onChange={(e) => set('wallet_address', e.target.value)}
                  required
                />
                <span className="form-hint">Double-check your address. Withdrawals to wrong addresses cannot be reversed.</span>
              </div>
            </div>

            <div className="alert alert-info" style={{ margin: '20px 0' }}>
              Processing time: 24–48 business hours after approval.
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-full btn-lg"
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> Processing…</> : '↑ Submit Withdrawal Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
