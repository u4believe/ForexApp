import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();

  const [editingNok, setEditingNok] = useState(false);
  const [nokForm, setNokForm] = useState({ nok_name: '', nok_phone: '', nok_email: '' });
  const [nokLoading, setNokLoading] = useState(false);
  const [nokError, setNokError] = useState('');
  const [nokSuccess, setNokSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setNokForm({
        nok_name: user.nok_name || '',
        nok_phone: user.nok_phone || '',
        nok_email: user.nok_email || '',
      });
    }
  }, [user]);

  const handleNokSubmit = async (e) => {
    e.preventDefault();
    if (!nokForm.nok_name.trim()) { setNokError('Next of kin name is required'); return; }
    if (!nokForm.nok_phone.trim() && !nokForm.nok_email.trim()) {
      setNokError('At least one contact method (phone or email) is required'); return;
    }
    setNokLoading(true);
    setNokError('');
    try {
      await api.put('/user/next-of-kin', nokForm);
      await refreshUser();
      setNokSuccess('Next of kin information saved.');
      setEditingNok(false);
      setTimeout(() => setNokSuccess(''), 4000);
    } catch (err) {
      setNokError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setNokLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingNok(false);
    setNokError('');
    setNokForm({
      nok_name: user?.nok_name || '',
      nok_phone: user?.nok_phone || '',
      nok_email: user?.nok_email || '',
    });
  };

  const fields = [
    { label: 'Full Name', value: user?.full_name || '—' },
    { label: 'Email Address', value: user?.email },
    { label: 'Phone Number', value: user?.phone || '—' },
    { label: 'Home Address', value: user?.address || '—' },
  ];

  const joined = user?.created_at
    ? new Date(user.created_at * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const hasNok = user?.nok_name;

  return (
    <div>
      <h1 className="dash-page-title">My Profile</h1>
      <p className="dash-page-sub">Your account information and verification status</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Info */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'var(--gold-gradient)', color: '#060D18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700,
              }}>
                {(user?.full_name || user?.email || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                  {user?.full_name || 'Investor'}
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-faint)' }}>Member since {joined}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {fields.map((f) => (
                <div key={f.label} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '20px', fontSize: '1.1rem' }}>
              Verification Status
            </h3>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              {user?.verification_status === 'verified' && (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                  <span className="badge badge-verified" style={{ fontSize: '0.92rem', padding: '8px 20px' }}>✓ Identity Verified</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginTop: '16px', lineHeight: '1.6' }}>
                    Your identity has been verified. You have full access to all features including withdrawals.
                  </p>
                </>
              )}
              {user?.verification_status === 'pending' && (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏳</div>
                  <span className="badge badge-pending" style={{ fontSize: '0.92rem', padding: '8px 20px' }}>Pending Review</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginTop: '16px', lineHeight: '1.6' }}>
                    Your documents are under review. This typically takes 1–2 business days.
                  </p>
                </>
              )}
              {user?.verification_status === 'rejected' && (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
                  <span className="badge badge-rejected" style={{ fontSize: '0.92rem', padding: '8px 20px' }}>Verification Rejected</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginTop: '16px', lineHeight: '1.6' }}>
                    Your verification was not approved. Please contact support for assistance.
                  </p>
                </>
              )}
              {user?.verification_status === 'unverified' && (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🪪</div>
                  <span className="badge badge-unverified" style={{ fontSize: '0.92rem', padding: '8px 20px' }}>Not Verified</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', marginTop: '16px', lineHeight: '1.6' }}>
                    Complete your KYC verification to unlock all features including withdrawals.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '14px', fontSize: '1rem' }}>
              Account Security
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>Email Verification</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-faint)' }}>{user?.email}</div>
                </div>
                <span className="badge badge-verified">✓ Verified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>KYC Documents</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-faint)' }}>Identity documentation</div>
                </div>
                <span className={`badge ${user?.kyc_submitted ? 'badge-verified' : 'badge-unverified'}`}>
                  {user?.kyc_submitted ? '✓ Submitted' : '○ Pending'}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: '16px' }}
            onClick={() => { logout(); window.location.href = '/'; }}
          >
            ⬡ Sign Out
          </button>
        </div>
      </div>

      {/* Next of Kin — full width */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', marginBottom: '4px' }}>
              Next of Kin
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)', margin: 0 }}>
              Emergency contact information for your account
            </p>
          </div>
          {!editingNok && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              onClick={() => { setEditingNok(true); setNokError(''); setNokSuccess(''); }}
            >
              {hasNok ? 'Edit' : '+ Add'}
            </button>
          )}
        </div>

        {nokSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '16px' }}>
            ✓ {nokSuccess}
          </div>
        )}

        {!editingNok ? (
          hasNok ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { label: 'Full Name', value: user.nok_name },
                { label: 'Phone Number', value: user.nok_phone || '—' },
                { label: 'Email Address', value: user.nok_email || '—' },
              ].map((f) => (
                <div key={f.label}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>{f.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)', fontSize: '0.88rem' }}>
              No next of kin information added yet. Click <strong>+ Add</strong> to provide emergency contact details.
            </div>
          )
        ) : (
          <form onSubmit={handleNokSubmit}>
            {nokError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                ⚠ {nokError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Full Name <span style={{ color: 'var(--gold-600)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jane Doe"
                  value={nokForm.nok_name}
                  onChange={(e) => { setNokForm(f => ({ ...f, nok_name: e.target.value })); setNokError(''); }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Phone Number <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 555 000 0000"
                  value={nokForm.nok_phone}
                  onChange={(e) => { setNokForm(f => ({ ...f, nok_phone: e.target.value })); setNokError(''); }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Email Address <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. jane@example.com"
                  value={nokForm.nok_email}
                  onChange={(e) => { setNokForm(f => ({ ...f, nok_email: e.target.value })); setNokError(''); }}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginBottom: '20px' }}>
              * Name is required. At least one contact method (phone or email) must be provided.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-gold" disabled={nokLoading}>
                {nokLoading ? <><span className="spinner" /> Saving…</> : 'Save Next of Kin'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
