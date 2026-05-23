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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`PrimePi server running on port ${PORT}`));
