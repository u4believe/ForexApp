import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function AuthModal({ mode, onClose, onSwitch }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'forgot' | 'forgot-sent'
  const [forgotEmail, setForgotEmail] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setStep('forgot-sent');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', { email: form.email, password: form.password });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      onClose();
      navigate(res.data.user.kyc_submitted ? '/dashboard' : '/kyc');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const isRegister = mode === 'register';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--gold-600)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 8 }}>
            ◆ CAPITALPIP MARKETS
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>
            {step === 'forgot' ? 'Reset Password' : step === 'forgot-sent' ? 'Check Your Email' : isRegister ? 'Create Your Account' : 'Sign In'}
          </h2>
          <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>
            {step === 'forgot' ? 'Enter your email to receive a reset link'
              : step === 'forgot-sent' ? 'A reset link has been sent if the email is registered'
              : isRegister ? 'Start your investment journey today' : 'Access your investment dashboard'}
          </p>
        </div>

        {/* Forgot password — email entry */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={e => { setForgotEmail(e.target.value); setError(''); }}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('form'); setError(''); }}
              style={{ marginTop: 14, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.85rem' }}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Forgot password — confirmation */}
        {step === 'forgot-sent' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📬</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 24 }}>
              If <strong>{forgotEmail}</strong> is registered with us, you will receive a password reset link shortly. The link expires in <strong>1 hour</strong>.
            </p>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginBottom: 20 }}>
              Check your spam/junk folder if you don't see it.
            </p>
            <button className="btn btn-outline btn-full" onClick={() => { setStep('form'); setError(''); }}>
              Back to Sign In
            </button>
          </div>
        )}

        {/* Normal register success */}
        {step === 'form' && success && (
          <div>
            <div className="alert alert-success" style={{ flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <strong>Registration Successful</strong>
              <span style={{ fontWeight: 400 }}>{success}</span>
            </div>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.83rem', textAlign: 'center', marginBottom: 16 }}>
              Check your inbox and spam folder for the verification email.
            </p>
            <button className="btn btn-outline btn-full" onClick={() => { setSuccess(''); onSwitch('login'); }}>
              Continue to Sign In
            </button>
          </div>
        )}

        {/* Login / Register form */}
        {step === 'form' && !success && (
          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(form.email); setStep('forgot'); setError(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-700)', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder={isRegister ? 'Minimum 8 characters' : 'Your password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                    style={{ paddingRight: 44 }}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
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

              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}
            </div>

            {isRegister && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 10, lineHeight: 1.6 }}>
                By creating an account you agree to our{' '}
                <a href="#" style={{ color: 'var(--gold-700)' }}>Terms of Service</a> and{' '}
                <a href="#" style={{ color: 'var(--gold-700)' }}>Privacy Policy</a>.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-gold btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading
                ? <><span className="spinner" /> Processing…</>
                : isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <div className="divider" style={{ margin: '18px 0 14px' }}>or</div>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-faint)' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => onSwitch(isRegister ? 'login' : 'register')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem',
                }}
              >
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
