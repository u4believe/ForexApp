import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/auth/verify/${token}`)
      .then(async res => {
        localStorage.setItem('pv_token', res.data.token);
        await refreshUser();
        setStatus('success');
        setTimeout(() => navigate(res.data.requiresKyc ? '/kyc' : '/dashboard'), 2500);
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'Verification failed');
        setStatus('error');
      });
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--page-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: 'var(--section-bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '48px 40px',
        maxWidth: 420, width: '100%', textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--gold-600)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 28 }}>
          ◆ CAPITALPIP MARKETS
        </div>

        {status === 'verifying' && (
          <>
            <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 20px', borderWidth: 3 }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>Verifying Your Email</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Please wait a moment…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--success-bg)', border: '1px solid var(--success-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '1.5rem',
            }}>✓</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--success)', marginBottom: 10 }}>
              Email Verified
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 20 }}>
              Your email address has been confirmed. Redirecting you to complete your account setup…
            </p>
            <div className="spinner" style={{ width: 22, height: 22, margin: '0 auto' }} />
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '1.4rem', color: 'var(--danger)',
            }}>✕</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--danger)', marginBottom: 10 }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 28 }}>
              {message}. The link may have expired or already been used.
            </p>
            <button className="btn btn-gold btn-full" onClick={() => navigate('/')}>
              Return to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}
