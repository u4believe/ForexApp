import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function KYC() {
  const navigate = useNavigate();
  const { refreshUser, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', id_photo: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFieldErrors(e => ({ ...e, [k]: '' })); setError(''); };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setFieldErrors(e => ({ ...e, id_photo: 'File must be under 10MB' })); return; }
    set('id_photo', file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else setPreview(null);
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full legal name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (Object.keys(errs).length) { setFieldErrors(errs); return false; }
    return true;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.address.trim()) errs.address = 'Home address is required';
    if (!form.id_photo) errs.id_photo = 'Government ID photo is required';
    if (Object.keys(errs).length) { setFieldErrors(errs); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true); setError('');
    try {
      const data = new FormData();
      data.append('full_name', form.full_name.trim());
      data.append('phone', form.phone.trim());
      data.append('address', form.address.trim());
      data.append('id_photo', form.id_photo);
      await api.post('/user/kyc', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  const stepStyle = (n) => ({
    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
    background: step >= n ? 'var(--gold-gradient)' : 'var(--section-alt)',
    border: step >= n ? 'none' : '1.5px solid var(--border)',
    color: step >= n ? '#fff' : 'var(--text-faint)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.82rem', fontWeight: 700,
  });

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--page-bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--gold-600)', letterSpacing: '0.16em', fontWeight: 700, marginBottom: 8 }}>
          ◆ CAPITALPIP MARKETS
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: 8 }}>
          Identity Verification
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420, lineHeight: 1.65 }}>
          We are required to verify your identity before activating full account features.
          This process typically takes 1–2 business days.
        </p>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        {[
          { n: 1, label: 'Personal Details' },
          { n: 2, label: 'Address & ID' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={stepStyle(s.n)}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: step >= s.n ? 'var(--text-primary)' : 'var(--text-faint)' }}>
                {s.label}
              </span>
            </div>
            {i === 0 && (
              <div style={{ width: 48, height: 1, background: step > 1 ? 'var(--gold-500)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--section-bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '32px 28px',
        width: '100%', maxWidth: 500, boxShadow: 'var(--shadow)',
      }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Personal Information</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: 22 }}>
              Provide your real legal name exactly as it appears on your government-issued ID.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Legal Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="As it appears on your ID"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                />
                {fieldErrors.full_name && <span className="form-error">{fieldErrors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
                {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
              </div>
            </div>
            <button
              className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: 24 }}
              onClick={() => { if (validateStep1()) setStep(2); }}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>Address & ID Document</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: 22 }}>
              Your home address and a clear photo of a government-issued identification document.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Home Address *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Street, City, State/Province, Country"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                {fieldErrors.address && <span className="form-error">{fieldErrors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Government ID Photo *</label>
                <div
                  style={{
                    border: `2px dashed ${fieldErrors.id_photo ? 'var(--danger)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: 24, textAlign: 'center', cursor: 'pointer',
                    background: 'var(--section-alt)', position: 'relative',
                    transition: 'border-color var(--transition)',
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile({ target: { files: [f] } }); }}
                >
                  {preview ? (
                    <div>
                      <img src={preview} alt="ID preview" style={{ maxHeight: 130, borderRadius: 8, objectFit: 'cover' }} />
                      <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: 8, fontWeight: 600 }}>
                        ✓ {form.id_photo.name}
                      </p>
                    </div>
                  ) : form.id_photo ? (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                      <p style={{ color: 'var(--success)', fontSize: '0.83rem', fontWeight: 600 }}>✓ {form.id_photo.name}</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: 10 }}>🪪</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 5 }}>
                        Drag & drop or click to upload
                      </p>
                      <p style={{ color: 'var(--text-faint)', fontSize: '0.76rem' }}>
                        Passport · National ID · Driver's Licence · JPG, PNG, PDF · Max 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,.pdf"
                    onChange={handleFile}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {fieldErrors.id_photo && <span className="form-error">{fieldErrors.id_photo}</span>}
                <span className="form-hint">Document must clearly display your name and photograph.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Submitting…</> : 'Submit for Verification →'}
              </button>
            </div>
          </form>
        )}

        <div style={{
          marginTop: 20, padding: '12px 14px',
          background: 'var(--section-alt)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-faint)', lineHeight: 1.65 }}>
            <strong style={{ color: 'var(--gold-700)' }}>Your data is secure.</strong>{' '}
            All documents are encrypted at rest. We do not share your personal information with any third party.
          </p>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-faint)',
            fontSize: '0.78rem', cursor: 'pointer', marginTop: 14,
            width: '100%', textAlign: 'center', transition: 'color var(--transition)',
          }}
        >
          Sign out and return to homepage
        </button>
      </div>
    </div>
  );
}
