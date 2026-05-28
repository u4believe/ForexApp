require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1); // Railway / reverse-proxy environments

app.use(helmet());
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || '').split(',').map(u => u.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                      // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});

// Strict limiter for routes that send emails — protects Resend daily quota
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before trying again.' },
});
app.use('/api/auth/register', emailLimiter);
app.use('/api/auth/forgot-password', emailLimiter);

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/market', require('./routes/market'));

// Catch unhandled async route errors (Express 4 doesn't do this automatically)
app.use((err, req, res, _next) => {
  console.error('Unhandled route error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function ensureAdminExists() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  const db = require('./db');
  const bcrypt = require('bcryptjs');
  try {
    // Find by email regardless of current role
    const existing = (await db.users.findAll({ email: process.env.ADMIN_EMAIL.toLowerCase() }))[0];
    if (existing) {
      // Promote to admin if not already
      if (existing.role !== 'admin') {
        await db.users.update(existing.id, { role: 'admin', email_verified: 1, verification_status: 'verified' });
        console.log('Existing user promoted to admin');
      }
    } else {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await db.users.create({
        email: process.env.ADMIN_EMAIL.toLowerCase(), password: hashed,
        email_verified: 1, kyc_submitted: 1, verification_status: 'verified', role: 'admin',
      });
      console.log('Admin user created');
    }
  } catch (err) {
    console.error('Failed to ensure admin exists:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`CapitalPip Markets server running on port ${PORT}`);
  await ensureAdminExists();
});
