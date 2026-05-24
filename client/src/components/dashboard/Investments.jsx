import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const PLANS = [
  { name: 'Starter',  min: 100,    max: 1000,   roi: '7% – 15%', fee: '20%', color: '#8899AF' },
  { name: 'Growth',   min: 1100,   max: 10000,  roi: '7% – 15%', fee: '15%', color: '#C9A84C', popular: true },
  { name: 'Premium',  min: 10100,  max: 50000,  roi: '7% – 15%', fee: '10%', color: '#E0BA5C' },
  { name: 'Elite',    min: 50100,  max: null,   roi: '7% – 15%', fee: '5%',  color: '#F2CC6E' },
];

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });
const fmtDate = (ts) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Investments({ transactions, refreshTransactions }) {
  const { user } = useAuth();
  const { investments = [] } = transactions;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const balance = user?.balance || 0;
  const currentInv = investments.find(i => ['active', 'pending'].includes(i.status));

  const handleSelect = async (planName) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/user/investments/select', { plan_name: planName });
      setSuccess(res.data.message);
      if (refreshTransactions) refreshTransactions();
      setTimeout(() => setSuccess(''), 7000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to select plan. Please try again.');
    }
    setBusy(false);
  };

  return (
    <div>
      <h1 className="dash-page-title">Investment Plans</h1>
      <p className="dash-page-sub">Select a plan that matches your balance to start earning bi-weekly returns</p>

      {/* Current plan banner */}
      {currentInv && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            borderColor: currentInv.status === 'active' ? 'var(--success-border)' : 'rgba(201,168,76,0.4)',
            background: currentInv.status === 'active' ? 'var(--success-bg)' : 'rgba(201,168,76,0.06)',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}
        >
          <div style={{ fontSize: '2rem' }}>{currentInv.status === 'active' ? '✅' : '⏳'}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>
              {currentInv.status === 'active'
                ? `${currentInv.plan_name} Plan — Active`
                : `${currentInv.plan_name} Plan — Pending Approval`}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>
              {currentInv.status === 'active'
                ? `Earning ${currentInv.roi_min}%–${currentInv.roi_max}% bi-weekly · Profit fee: ${currentInv.profit_fee}%`
                : 'Your request has been submitted and is awaiting admin review. You will be notified once approved.'}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>✓ {success}</div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>⚠ {error}</div>
      )}

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {PLANS.map((plan) => {
          const eligible = balance >= plan.min;
          const isActive = currentInv?.plan_name === plan.name && currentInv?.status === 'active';
          const isPending = currentInv?.plan_name === plan.name && currentInv?.status === 'pending';
          const isCurrent = isActive || isPending;

          return (
            <div
              key={plan.name}
              className="card"
              style={{
                position: 'relative',
                borderColor: isActive ? 'var(--success-border)' : isPending ? 'rgba(201,168,76,0.5)' : plan.popular ? 'var(--gold-500)' : undefined,
                boxShadow: isCurrent ? '0 0 20px rgba(201,168,76,0.15)' : plan.popular ? '0 0 20px rgba(201,168,76,0.1)' : undefined,
                opacity: eligible ? 1 : 0.72,
              }}
            >
              {/* Top badge */}
              {isActive && (
                <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: '#fff', fontSize: '0.67rem', fontWeight: 700, padding: '3px 12px', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                  ✓ Active
                </div>
              )}
              {isPending && (
                <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: '#b45309', color: '#fff', fontSize: '0.67rem', fontWeight: 700, padding: '3px 12px', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                  ⏳ Pending
                </div>
              )}
              {!isCurrent && plan.popular && (
                <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold-gradient)', color: '#060D18', fontSize: '0.67rem', fontWeight: 700, padding: '3px 12px', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: '1rem', color: plan.color, marginBottom: '4px' }}>{plan.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '2px' }}>
                ${plan.min.toLocaleString()}{plan.max ? ` – $${plan.max.toLocaleString()}` : '+'}
              </div>

              {!eligible && (
                <div style={{ fontSize: '0.72rem', color: 'var(--danger, #dc3545)', marginBottom: '8px', fontWeight: 500 }}>
                  Requires ${plan.min.toLocaleString()} balance
                </div>
              )}

              <div style={{
                fontSize: '1.55rem', fontFamily: "'Playfair Display', serif", fontWeight: 700,
                background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1, margin: '12px 0 4px',
              }}>{plan.roi}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '12px' }}>Bi-Weekly ROI</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Profit fee: <strong style={{ color: 'var(--text-secondary)' }}>{plan.fee}</strong>
              </div>

              {isCurrent ? (
                <button className="btn btn-ghost btn-full" disabled style={{ fontSize: '0.82rem', opacity: 0.65 }}>
                  {isActive ? '✓ Current Plan' : '⏳ Awaiting Approval'}
                </button>
              ) : !eligible ? (
                <button className="btn btn-ghost btn-full" disabled style={{ fontSize: '0.82rem', cursor: 'not-allowed', opacity: 0.5 }}>
                  Not Eligible
                </button>
              ) : (
                <button
                  className="btn btn-gold btn-full"
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => handleSelect(plan.name)}
                  disabled={busy}
                >
                  {busy ? <><span className="spinner" /> Processing…</> : currentInv ? 'Switch to This Plan' : 'Select Plan'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Balance hint */}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '28px' }}>
        Your current balance: <strong style={{ color: 'var(--gold-600)' }}>${fmt(balance)}</strong>
        {!currentInv && balance < 100 && ' — Deposit at least $100 to become eligible for a plan.'}
      </p>

      {/* Investment history */}
      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '20px', fontSize: '1.1rem' }}>
          Investment History
        </h3>
        {investments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
            <p>No investments yet. Select a plan above to get started.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>ROI Range</th>
                  <th>Profit Fee</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.plan_name}</td>
                    <td>${fmt(parseFloat(inv.amount))}</td>
                    <td>{inv.roi_min}% – {inv.roi_max}%</td>
                    <td>{inv.profit_fee}%</td>
                    <td>
                      <span className={`badge ${
                        inv.status === 'active'    ? 'badge-verified'   :
                        inv.status === 'pending'   ? 'badge-pending'    :
                        inv.status === 'rejected'  ? 'badge-rejected'   :
                        'badge-unverified'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '0.83rem' }}>{fmtDate(inv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
