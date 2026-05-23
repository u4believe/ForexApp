import { useNavigate } from 'react-router-dom';

export default function Overview({ user, transactions }) {
  const navigate = useNavigate();
  const { deposits = [], withdrawals = [] } = transactions;

  const confirmedDeposits = deposits.filter(d => d.status === 'confirmed');
  const totalDeposited = confirmedDeposits.reduce((s, d) => s + (d.amount || 0), 0);
  const totalWithdrawn = withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0);

  const recent = [
    ...deposits.map(d => ({ ...d, type: 'deposit' })),
    ...withdrawals.map(w => ({ ...w, type: 'withdrawal' })),
  ].sort((a, b) => b.created_at - a.created_at).slice(0, 8);

  const formatDate = (ts) => new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const statusEl = (s) => {
    const map = {
      pending: 'badge badge-pending',
      confirmed: 'badge badge-verified',
      approved: 'badge badge-verified',
      rejected: 'badge badge-rejected',
    };
    return <span className={map[s] || 'badge badge-unverified'}>{s}</span>;
  };

  return (
    <div>
      <div>
        <h1 className="dash-page-title">Portfolio Overview</h1>
        <p className="dash-page-sub">Welcome back, {user?.full_name || 'Investor'}</p>
      </div>

      {/* Verification Banner */}
      {user?.verification_status === 'pending' && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          <div>
            <strong>Account Under Review</strong><br />
            <span style={{ fontSize: '0.87rem' }}>
              Your identity verification is in progress. You can deposit funds now.
              Withdrawals will be enabled once your account is verified.
            </span>
          </div>
        </div>
      )}
      {user?.verification_status === 'unverified' && (
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          <div>
            <strong>Complete Your Verification</strong><br />
            <span style={{ fontSize: '0.87rem' }}>Please complete KYC to activate full account features.</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <div className="dash-stat-label">Account Balance</div>
          <div className="dash-stat-value gold">
            ${(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="dash-stat-sub">Available funds</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Deposited</div>
          <div className="dash-stat-value">
            ${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="dash-stat-sub">{confirmedDeposits.length} confirmed deposits</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Total Withdrawn</div>
          <div className="dash-stat-value">
            ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="dash-stat-sub">{withdrawals.filter(w => w.status === 'approved').length} processed</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-label">Account Status</div>
          <div style={{ marginTop: '6px' }}>
            {user?.verification_status === 'verified' && <span className="badge badge-verified">✓ Verified</span>}
            {user?.verification_status === 'pending' && <span className="badge badge-pending">⏳ Pending Review</span>}
            {user?.verification_status === 'rejected' && <span className="badge badge-rejected">✗ Rejected</span>}
            {user?.verification_status === 'unverified' && <span className="badge badge-unverified">○ Unverified</span>}
          </div>
          <div className="dash-stat-sub" style={{ marginTop: '6px' }}>KYC verification</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        <button
          className="btn btn-gold btn-full"
          onClick={() => navigate('/dashboard/deposit')}
          style={{ justifyContent: 'center', padding: '14px' }}
        >
          💳 Make a Deposit
        </button>
        <button
          className={`btn btn-full ${user?.verification_status === 'verified' ? 'btn-outline' : 'btn-ghost'}`}
          onClick={() => user?.verification_status === 'verified' && navigate('/dashboard/withdraw')}
          disabled={user?.verification_status !== 'verified'}
          style={{ justifyContent: 'center', padding: '14px' }}
        >
          ↑ Request Withdrawal
          {user?.verification_status !== 'verified' && <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: 'var(--text-faint)' }}>(Verified only)</span>}
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '20px', fontSize: '1.15rem' }}>
          Recent Transactions
        </h3>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
            <p>No transactions yet. Make your first deposit to get started.</p>
            <button className="btn btn-gold btn-sm" style={{ marginTop: '16px' }} onClick={() => navigate('/dashboard/deposit')}>
              Make First Deposit
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={`${tx.type}-${tx.id}`}>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: tx.type === 'deposit' ? 'var(--success)' : 'var(--gold-600)',
                        fontWeight: 500, fontSize: '0.85rem',
                      }}>
                        {tx.type === 'deposit' ? '↓ Deposit' : '↑ Withdrawal'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {tx.crypto}{tx.network ? ` (${tx.network})` : ''}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {tx.amount ? `$${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td>{statusEl(tx.status)}</td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '0.83rem' }}>{formatDate(tx.created_at)}</td>
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
