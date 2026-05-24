import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminPanel() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [balanceEdit, setBalanceEdit] = useState({ userId: null, value: '' });
  const [kycUrl, setKycUrl] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [investments, setInvestments] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [assignPlan, setAssignPlan] = useState('');

  const PLANS = ['Starter', 'Growth', 'Premium', 'Elite'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch { }
    setLoading(false);
  };

  const fetchInvestments = async () => {
    setInvLoading(true);
    try {
      const res = await api.get('/admin/investments/pending');
      setInvestments(res.data);
    } catch { }
    setInvLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (tab === 'investments') fetchInvestments(); }, [tab]);

  const updateStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      setMsg(`Status updated to "${status}"`);
      fetchData();
      if (selectedUser?.user?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, user: { ...prev.user, verification_status: status } } : null);
      }
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Update failed'); }
  };

  const fetchKycUrl = async (userId) => {
    setKycLoading(true);
    setKycUrl(null);
    try {
      const res = await api.get(`/admin/users/${userId}/kyc-url`);
      setKycUrl(res.data.url);
    } catch { setKycUrl(null); }
    setKycLoading(false);
  };

  const viewUser = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setKycUrl(null);
      if (res.data.user?.id_photo_path) fetchKycUrl(userId);
    } catch { }
  };

  const saveBalance = async (userId) => {
    const val = parseFloat(balanceEdit.value);
    if (isNaN(val) || val < 0) { setMsg('Invalid balance amount'); return; }
    try {
      await api.put(`/admin/users/${userId}/balance`, { balance: val });
      setMsg(`Balance updated to $${val.toFixed(2)}`);
      setBalanceEdit({ userId: null, value: '' });
      fetchData();
      if (selectedUser?.user?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, user: { ...prev.user, balance: val } } : null);
      }
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Balance update failed'); }
  };

  const formatDate = (ts) => ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const statusBadge = (s) => {
    const map = { verified: 'badge-verified', pending: 'badge-pending', rejected: 'badge-rejected', unverified: 'badge-unverified' };
    return <span className={`badge ${map[s] || 'badge-unverified'}`}>{s || 'unverified'}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', background: 'var(--section-bg)', borderRight: '1px solid var(--border)',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0,
      }}>
        <div style={{ padding: '0 4px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--gold-500)', letterSpacing: '0.15em', marginBottom: '4px' }}>◆ ADMIN PANEL</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>PrimePi</div>
        </div>

        {[
          { key: 'users', label: '👥 Users' },
          { key: 'investments', label: '📈 Investments' },
          { key: 'stats', label: '📊 Statistics' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? 'rgba(201,168,76,0.12)' : 'none',
              border: tab === t.key ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
              color: tab === t.key ? 'var(--gold-600)' : 'var(--text-faint)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: 500, textAlign: 'left', transition: 'all var(--transition)',
            }}
          >
            {t.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <button
            className="btn btn-ghost btn-sm btn-full"
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: '8px' }}
          >
            ← User Dashboard
          </button>
          <button
            className="btn btn-ghost btn-sm btn-full"
            onClick={() => { logout(); navigate('/'); }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {msg && (
          <div className="alert alert-success" style={{ marginBottom: '20px', position: 'fixed', top: '20px', right: '20px', zIndex: 999, maxWidth: '300px' }}>
            ✓ {msg}
          </div>
        )}

        {tab === 'investments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Pending Investment Requests</h2>
              <button className="btn btn-ghost btn-sm" onClick={fetchInvestments}>↻ Refresh</button>
            </div>
            {invLoading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}><span className="spinner" style={{ width: '32px', height: '32px' }} /></div>
            ) : investments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-faint)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
                <p>No pending investment requests.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>ROI</th>
                      <th>Fee</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600 }}>{inv.user_name}</td>
                        <td style={{ fontSize: '0.83rem' }}>{inv.user_email}</td>
                        <td><span style={{ fontWeight: 600, color: 'var(--gold-600)' }}>{inv.plan_name}</span></td>
                        <td>${parseFloat(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>{inv.roi_min}%–{inv.roi_max}%</td>
                        <td>{inv.profit_fee}%</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{formatDate(inv.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.75rem' }}
                              onClick={async () => {
                                await api.put(`/admin/investments/${inv.id}/approve`);
                                setMsg(`${inv.plan_name} plan approved for ${inv.user_email}`);
                                fetchInvestments();
                                setTimeout(() => setMsg(''), 4000);
                              }}
                            >✓ Approve</button>
                            <button
                              className="btn btn-sm"
                              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '0.75rem' }}
                              onClick={async () => {
                                await api.put(`/admin/investments/${inv.id}/reject`);
                                setMsg(`Investment rejected for ${inv.user_email}`);
                                fetchInvestments();
                                setTimeout(() => setMsg(''), 4000);
                              }}
                            >✗ Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '24px' }}>Platform Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers || 0, color: 'var(--gold-600)' },
                { label: 'Pending KYC', value: stats.pendingKyc || 0, color: 'var(--warning)' },
                { label: 'Verified Users', value: stats.verified || 0, color: 'var(--success)' },
                { label: 'Pending Deposits', value: stats.pendingDeposits || 0, color: 'var(--text-secondary)' },
                { label: 'Pending Withdrawals', value: stats.pendingWithdrawals || 0, color: 'var(--danger)' },
              ].map(s => (
                <div key={s.label} className="card">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }}>User Management</h2>
              <button className="btn btn-ghost btn-sm" onClick={fetchData}>↻ Refresh</button>
            </div>

            {selectedUser && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem' }}>
                    User Detail: {selectedUser.user.full_name || selectedUser.user.email}
                  </h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(null)}>× Close</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {[
                    ['Email', selectedUser.user.email],
                    ['Full Name', selectedUser.user.full_name || '—'],
                    ['Phone', selectedUser.user.phone || '—'],
                    ['Home Address', selectedUser.user.address || '—'],
                    ['Joined', formatDate(selectedUser.user.created_at)],
                    ['Email Verified', selectedUser.user.email_verified ? 'Yes' : 'No'],
                    ['Next of Kin', selectedUser.user.nok_name || '—'],
                    ['NOK Contact', selectedUser.user.nok_phone || selectedUser.user.nok_email || '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--section-alt)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: '4px' }}>{k}</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* KYC Document Viewer */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      KYC Document
                    </div>
                    {selectedUser.user.id_photo_path && (
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => fetchKycUrl(selectedUser.user.id)}>
                        ↻ Refresh
                      </button>
                    )}
                  </div>

                  {!selectedUser.user.kyc_submitted ? (
                    <div style={{ padding: '16px', background: 'var(--section-alt)', borderRadius: 'var(--radius-sm)', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
                      User has not submitted KYC yet
                    </div>
                  ) : !selectedUser.user.id_photo_path ? (
                    <div style={{ padding: '16px', background: 'var(--section-alt)', borderRadius: 'var(--radius-sm)', color: 'var(--warning)', fontSize: '0.85rem' }}>
                      ⚠ KYC submitted but no document on file
                    </div>
                  ) : kycLoading ? (
                    <div style={{ padding: '32px', textAlign: 'center', background: 'var(--section-alt)', borderRadius: 'var(--radius-sm)' }}>
                      <span className="spinner" />
                    </div>
                  ) : !kycUrl ? (
                    <div style={{ padding: '16px', background: 'var(--section-alt)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                      ⚠ Could not load document. <button onClick={() => fetchKycUrl(selectedUser.user.id)} style={{ background: 'none', border: 'none', color: 'var(--gold-600)', cursor: 'pointer', fontWeight: 600 }}>Try again</button>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--section-alt)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      {/\.(jpg|jpeg|png)$/i.test(selectedUser.user.id_photo_path) ? (
                        <img
                          src={kycUrl}
                          alt="Government ID"
                          style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', background: 'rgba(0,0,0,0.5)', display: 'block' }}
                        />
                      ) : (
                        <div style={{ padding: '32px', textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>PDF Document</div>
                        </div>
                      )}
                      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                        <a href={kycUrl} target="_blank" rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm" style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                          🔍 View Full Size
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: '10px' }}>Verification Status</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['pending', 'verified', 'rejected'].map(s => (
                        <button
                          key={s}
                          className={`btn btn-sm ${selectedUser.user.verification_status === s ? 'btn-gold' : 'btn-ghost'}`}
                          onClick={() => updateStatus(selectedUser.user.id, s)}
                        >
                          Set as {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: '10px' }}>
                      Account Balance — current: <strong style={{ color: 'var(--gold-600)' }}>${(selectedUser.user.balance || 0).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        style={{ maxWidth: '160px' }}
                        placeholder="New balance"
                        value={balanceEdit.userId === selectedUser.user.id ? balanceEdit.value : ''}
                        onChange={e => setBalanceEdit({ userId: selectedUser.user.id, value: e.target.value })}
                      />
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => saveBalance(selectedUser.user.id)}
                        disabled={balanceEdit.userId !== selectedUser.user.id || balanceEdit.value === ''}
                      >
                        Set Balance
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assign Plan */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: '10px' }}>Assign Investment Plan</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      className="form-input"
                      style={{ maxWidth: '180px' }}
                      value={assignPlan}
                      onChange={e => setAssignPlan(e.target.value)}
                    >
                      <option value="">— Select plan —</option>
                      {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button
                      className="btn btn-gold btn-sm"
                      disabled={!assignPlan}
                      onClick={async () => {
                        if (!assignPlan) return;
                        try {
                          const res = await api.post(`/admin/users/${selectedUser.user.id}/assign-plan`, { plan_name: assignPlan });
                          setMsg(res.data.message);
                          setAssignPlan('');
                          setTimeout(() => setMsg(''), 4000);
                        } catch (err) {
                          setMsg(err.response?.data?.error || 'Failed to assign plan');
                          setTimeout(() => setMsg(''), 4000);
                        }
                      }}
                    >
                      Assign Plan
                    </button>
                  </div>
                </div>

                {/* User Deposits */}
                {selectedUser.deposits?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>Deposits ({selectedUser.deposits.length})</div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead><tr><th>Crypto</th><th>Network</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                          {selectedUser.deposits.map(d => (
                            <tr key={d.id}>
                              <td>{d.crypto}</td>
                              <td>{d.network || '—'}</td>
                              <td>{d.amount ? `$${d.amount.toFixed(2)}` : '—'}</td>
                              <td>{statusBadge(d.status)}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{formatDate(d.created_at)}</td>
                              <td>
                                {d.status === 'pending' && (
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.75rem' }}
                                    onClick={async () => {
                                      await api.put(`/admin/deposits/${d.id}/status`, { status: 'confirmed' });
                                      viewUser(selectedUser.user.id);
                                      fetchData();
                                    }}
                                  >
                                    ✓ Confirm
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* User Withdrawals */}
                {selectedUser.withdrawals?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>Withdrawals ({selectedUser.withdrawals.length})</div>
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead><tr><th>Amount</th><th>Crypto</th><th>Wallet</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                          {selectedUser.withdrawals.map(w => (
                            <tr key={w.id}>
                              <td>${w.amount.toFixed(2)}</td>
                              <td>{w.crypto}</td>
                              <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.wallet_address}</td>
                              <td>{statusBadge(w.status)}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{formatDate(w.created_at)}</td>
                              <td>
                                {w.status === 'pending' && (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      className="btn btn-sm"
                                      style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.72rem' }}
                                      onClick={async () => {
                                        await api.put(`/admin/withdrawals/${w.id}/status`, { status: 'approved' });
                                        viewUser(selectedUser.user.id);
                                      }}
                                    >✓ Approve</button>
                                    <button
                                      className="btn btn-sm"
                                      style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '0.72rem' }}
                                      onClick={async () => {
                                        await api.put(`/admin/withdrawals/${w.id}/status`, { status: 'rejected' });
                                        viewUser(selectedUser.user.id);
                                      }}
                                    >✗ Reject</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}><span className="spinner" style={{ width: '32px', height: '32px' }} /></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>KYC</th>
                      <th>Status</th>
                      <th>Balance</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '32px' }}>No users yet</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.full_name || '—'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                        <td>{u.kyc_submitted ? <span className="badge badge-verified">✓ Submitted</span> : <span className="badge badge-unverified">Pending</span>}</td>
                        <td>{statusBadge(u.verification_status)}</td>
                        <td>
                          {balanceEdit.userId === u.id ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input
                                type="number" min="0" step="0.01"
                                className="form-input"
                                style={{ width: '100px', padding: '4px 8px', fontSize: '0.82rem' }}
                                value={balanceEdit.value}
                                onChange={e => setBalanceEdit({ userId: u.id, value: e.target.value })}
                                autoFocus
                              />
                              <button className="btn btn-gold btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => saveBalance(u.id)}>✓</button>
                              <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => setBalanceEdit({ userId: null, value: '' })}>✕</button>
                            </div>
                          ) : (
                            <span
                              style={{ color: 'var(--gold-600)', cursor: 'pointer', borderBottom: '1px dashed var(--gold-600)' }}
                              title="Click to edit balance"
                              onClick={() => setBalanceEdit({ userId: u.id, value: String(u.balance || 0) })}
                            >
                              ${(u.balance || 0).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>{formatDate(u.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => { viewUser(u.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            >
                              View
                            </button>
                            {u.verification_status !== 'verified' && u.kyc_submitted === 1 && (
                              <button
                                className="btn btn-sm"
                                style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontSize: '0.75rem' }}
                                onClick={() => updateStatus(u.id, 'verified')}
                              >
                                ✓ Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
