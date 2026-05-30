import { useState } from 'react';

const WHATSAPP = '15012293767';
const EMAIL = 'support.capitalpip@gmail.com';

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const openWhatsApp = () => {
    const text = message.trim() || 'Hello, I need support with my CapitalPip Markets account.';
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
    setMessage('');
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: '68px', right: 0,
          width: '318px',
          background: 'var(--section-bg, #0B1D3A)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #25D366 0%, #1ebe5d 100%)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>💬</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>CapitalPip Support</div>
              <div style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.8)' }}>● Online — replies in minutes</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1, padding: '2px 4px' }}
            >×</button>
          </div>

          {/* Body */}
          <div style={{ padding: '18px 16px 16px' }}>
            {/* Support info bubble */}
            <div style={{
              background: 'var(--section-alt, rgba(255,255,255,0.04))',
              border: '1px solid var(--border-light, rgba(255,255,255,0.06))',
              borderRadius: '12px', padding: '14px',
              marginBottom: '14px', fontSize: '0.84rem',
              lineHeight: 1.65, color: 'var(--text-secondary, #D4DCE8)',
            }}>
              <p style={{ margin: '0 0 8px' }}>
                👋 Hi! Welcome to <strong>CapitalPip Markets</strong> support.
              </p>
              <p style={{ margin: '0 0 10px', color: 'var(--text-muted, #8899AF)' }}>
                For the fastest response, chat us directly on WhatsApp:
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  color: '#25D366', fontWeight: 700, textDecoration: 'none',
                  fontSize: '0.92rem',
                }}
              >
                📱 +1 (501) 229-3767
              </a>
              <p style={{ margin: '10px 0 0', fontSize: '0.76rem', color: 'var(--text-faint, #506070)' }}>
                Email:{' '}
                <a href={`mailto:${EMAIL}`} style={{ color: 'var(--gold-500, #C9A84C)' }}>
                  {EMAIL}
                </a>
              </p>
            </div>

            {/* Message input */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint, #506070)', marginBottom: '6px' }}>
              Type your message to send via WhatsApp:
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="How can we help you today?"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--input-bg, rgba(255,255,255,0.05))',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                borderRadius: '8px', padding: '10px 12px',
                color: 'var(--text-primary, #F0F4FA)',
                fontSize: '0.84rem', resize: 'none', outline: 'none',
                fontFamily: 'inherit',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); openWhatsApp(); } }}
            />
            <button
              onClick={openWhatsApp}
              style={{
                marginTop: '10px', width: '100%',
                background: '#25D366', color: '#fff',
                border: 'none', borderRadius: '8px',
                padding: '11px', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.88rem',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '7px',
                transition: 'opacity 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Chat with Support"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: open ? '#888' : '#25D366',
          border: 'none', cursor: 'pointer',
          boxShadow: open ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 20px rgba(37,211,102,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: open ? '1.4rem' : '1.5rem',
          transition: 'background 0.2s, box-shadow 0.2s',
          color: '#fff',
        }}
      >
        {open ? '×' : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
      </button>

      <style>{`@keyframes chatSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
