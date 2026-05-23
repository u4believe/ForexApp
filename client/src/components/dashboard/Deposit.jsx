import { useState, useEffect } from 'react';
import api from '../../api';

export default function Deposit() {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ amount: '', txid: '' });
  const [loading, setLoading] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api.get('/user/deposit-addresses')
      .then(r => { setAddresses(r.data.addresses); setSelected(r.data.addresses[0]); })
      .catch(() => setError('Failed to load deposit addresses'))
      .finally(() => setLoadingAddr(false));
  }, []);

  const copyAddress = (addr, key) => {
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleNotify = async (e) => {
    e.preventDefault();
    if (!selected || !form.amount) { setError('Please select a currency and enter amount'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/user/deposit', {
        crypto: selected.crypto,
        network: selected.network,
        amount: parseFloat(form.amount),
        txid: form.txid,
      });
      setSuccess('Your deposit notification has been sent successfully. If your account is not credited within 24 hours, please contact support.');
      setForm({ amount: '', txid: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const ICONS = {
    btc: '₿',
    ltc: 'Ł',
    usdt: '₮',
    'usdt-eth': '₮',
  };

  return (
    <div>
      <h1 className="dash-page-title">Deposit Funds</h1>
      <p className="dash-page-sub">Send cryptocurrency to your account using the addresses below</p>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: Select currency & address */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '18px', fontSize: '1.05rem' }}>
              Select Currency
            </h3>
            {loadingAddr ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><span className="spinner" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map((addr) => (
                  <button
                    key={`${addr.crypto}-${addr.network}`}
                    onClick={() => setSelected(addr)}
                    style={{
                      background: selected?.address === addr.address
                        ? 'rgba(201,168,76,0.1)' : 'var(--section-alt)',
                      border: `1.5px solid ${selected?.address === addr.address ? 'var(--gold-500)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      textAlign: 'left',
                      transition: 'all var(--transition)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'rgba(201,168,76,0.15)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', color: 'var(--gold-600)', flexShrink: 0,
                    }}>
                      {ICONS[addr.icon] || '◎'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{addr.crypto}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>{addr.network}</div>
                    </div>
                    {selected?.address === addr.address && (
                      <span style={{ marginLeft: 'auto', color: 'var(--gold-600)', fontSize: '1rem' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="card">
              <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '6px', fontSize: '1.05rem' }}>
                {selected.crypto} Deposit Address
              </h3>
              <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem', marginBottom: '16px' }}>
                Network: <strong style={{ color: 'var(--text-secondary)' }}>{selected.network}</strong>
              </p>

              <div className="copy-field" style={{ marginBottom: '16px' }}>
                <span className="address-text">{selected.address}</span>
                <button
                  className={`copy-btn ${copied === selected.address ? 'copied' : ''}`}
                  onClick={() => copyAddress(selected.address, selected.address)}
                >
                  {copied === selected.address ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <div className="alert alert-warning" style={{ fontSize: '0.82rem' }}>
                ⚠ Only send <strong>{selected.crypto}</strong> on the <strong>{selected.network}</strong> network to this address. Sending other assets will result in permanent loss.
              </div>
            </div>
          )}
        </div>

        {/* Right: Notify deposit */}
        <div>
          <div className="card">
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '6px', fontSize: '1.05rem' }}>
              Notify Your Deposit
            </h3>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.83rem', marginBottom: '20px' }}>
              After sending, fill in the details below so we can confirm your deposit faster.
            </p>
            <form onSubmit={handleNotify}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Amount Sent (USD equivalent)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 500.00"
                    value={form.amount}
                    onChange={(e) => { setForm(f => ({ ...f, amount: e.target.value })); setError(''); }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction ID / Hash <span style={{ color: 'var(--text-faint)' }}>(Optional)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Blockchain transaction hash"
                    value={form.txid}
                    onChange={(e) => setForm(f => ({ ...f, txid: e.target.value }))}
                  />
                  <span className="form-hint">Providing the TX ID speeds up confirmation.</span>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-gold btn-full"
                style={{ marginTop: '20px' }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Submitting…</> : '✓ Notify Deposit'}
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '14px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>How Deposits Work</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['1', 'Select your preferred cryptocurrency'],
                ['2', 'Copy the wallet address and send from your wallet'],
                ['3', 'Notify us above after sending'],
                ['4', 'Funds credited after network confirmations (typically 10–30 mins)'],
              ].map(([n, text]) => (
                <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(201,168,76,0.12)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-600)', flexShrink: 0,
                  }}>{n}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '4px' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
