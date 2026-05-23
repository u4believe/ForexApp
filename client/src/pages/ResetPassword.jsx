import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--page-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--section-bg)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--gold-600)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 8 }}>
            ◆ PRIMEPI CAPITAL
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 6, color: 'var(--text-primary)' }}>
            {done ? 'Password Updated' : 'Set New Password'}
          </h2>
          <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>
            {done ? 'Your password has been changed successfully' : 'Enter and confirm your new password below'}
          </p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✅</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 24 }}>
              You can now sign in with your new password.
            </p>
            <button className="btn btn-gold btn-full btn-lg" onClick={() => navigate('/')}>
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                    autoFocus
                    style={{ paddingRight: 44 }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-faint)', fontSize: '0.85rem', padding: 4,
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Repeat your new password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading ? <><span className="spinner" /> Updating…</> : 'Update Password'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.83rem', color: 'var(--text-faint)' }}>
              Remembered it?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.83rem' }}
              >
                Back to Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
