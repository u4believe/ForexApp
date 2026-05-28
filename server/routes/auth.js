const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../mailer');
const db = require('../db');

const siteUrl = () => (process.env.FRONTEND_URL || '').split(',')[0].trim();

// Per-email cooldown — prevents the same address from triggering multiple sends
const emailCooldowns = new Map();
const EMAIL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function checkEmailCooldown(email) {
  const last = emailCooldowns.get(email);
  if (last && Date.now() - last < EMAIL_COOLDOWN_MS) return false;
  emailCooldowns.set(email, Date.now());
  if (emailCooldowns.size > 5000) {
    const cutoff = Date.now() - EMAIL_COOLDOWN_MS;
    for (const [k, v] of emailCooldowns) { if (v < cutoff) emailCooldowns.delete(k); }
  }
  return true;
}

async function sendVerificationEmail(email, token) {
  const link = `${siteUrl()}/verify-email/${token}`;
  await sendMail({
    to: email,
    subject: 'Verify Your CapitalPip Markets Account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B1628;color:#fff;padding:40px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#C9A84C;font-size:28px;margin:0;">CapitalPip Markets</h1>
          <p style="color:#8899AF;margin:5px 0 0;">Where Smart Money Grows</p>
        </div>
        <h2 style="color:#fff;font-size:22px;">Confirm Your Email Address</h2>
        <p style="color:#D4DCE8;line-height:1.6;">Thank you for registering. Click the button below to verify your email and continue setting up your account.</p>
        <div style="text-align:center;margin:35px 0;">
          <a href="${link}" style="background:linear-gradient(135deg,#C9A84C,#F2CC6E);color:#060D18;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color:#8899AF;font-size:13px;">This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
        <hr style="border-color:rgba(201,168,76,0.2);margin:30px 0;" />
        <p style="color:#506070;font-size:12px;text-align:center;">&copy; 2024 CapitalPip Markets. All rights reserved.</p>
      </div>
    `,
  });
}

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const existing = await db.users.findByEmail(email.toLowerCase());

    if (existing) {
      if (existing.email_verified) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      // Unverified — refresh token and resend
      if (!checkEmailCooldown(email.toLowerCase())) {
        return res.status(429).json({ error: 'A verification email was recently sent. Please wait 5 minutes before requesting another.' });
      }
      const token = uuidv4();
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      const hashed = await bcrypt.hash(password, 12);
      await db.users.update(existing.id, {
        password: hashed,
        verification_token: token,
        token_expires: expires,
      });
      try { await sendVerificationEmail(email.toLowerCase(), token); }
      catch (emailErr) { console.error('Email send failed:', emailErr.message); }
      return res.json({ message: 'A new verification link has been sent to your email. Please check your inbox.' });
    }

    if (!checkEmailCooldown(email.toLowerCase())) {
      return res.status(429).json({ error: 'Please wait 5 minutes before registering again with this email.' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const token = uuidv4();
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    await db.users.create({ email: email.toLowerCase(), password: hashed, verification_token: token, token_expires: expires });

    try { await sendVerificationEmail(email.toLowerCase(), token); }
    catch (emailErr) { console.error('Email send failed:', emailErr.message); }

    res.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await db.users.findByToken(token);

    if (!user) return res.status(400).json({ error: 'Invalid verification link' });
    if (Date.now() > user.token_expires) return res.status(400).json({ error: 'Verification link has expired. Please register again to get a new link.' });

    await db.users.update(user.id, { email_verified: 1, verification_token: null, token_expires: null });

    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Email verified successfully', token: jwtToken, requiresKyc: !user.kyc_submitted });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await db.users.findByEmail(email.toLowerCase());
    if (!user || !user.email_verified) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id, email: user.email, full_name: user.full_name,
        kyc_submitted: !!user.kyc_submitted, verification_status: user.verification_status,
        balance: user.balance, role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot password — send reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await db.users.findByEmail(email.toLowerCase());
    // Always return success to prevent email enumeration
    if (!user || !user.email_verified) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    if (!checkEmailCooldown(email.toLowerCase())) {
      return res.status(429).json({ error: 'A reset email was recently sent. Please wait 5 minutes before requesting another.' });
    }

    const token = uuidv4();
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour
    await db.users.update(user.id, { reset_token: token, reset_token_expires: expires });

    const link = `${siteUrl()}/reset-password/${token}`;
    await sendMail({
      to: email.toLowerCase(),
      subject: 'Reset Your CapitalPip Markets Password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B1628;color:#fff;padding:40px;border-radius:12px;">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="color:#C9A84C;font-size:28px;margin:0;">CapitalPip Markets</h1>
            <p style="color:#8899AF;margin:5px 0 0;">Where Smart Money Grows</p>
          </div>
          <h2 style="color:#fff;font-size:22px;">Password Reset Request</h2>
          <p style="color:#D4DCE8;line-height:1.6;">We received a request to reset the password for your account. Click the button below to set a new password.</p>
          <div style="text-align:center;margin:35px 0;">
            <a href="${link}" style="background:linear-gradient(135deg,#C9A84C,#F2CC6E);color:#060D18;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color:#8899AF;font-size:13px;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
          <hr style="border-color:rgba(201,168,76,0.2);margin:30px 0;" />
          <p style="color:#506070;font-size:12px;text-align:center;">&copy; 2024 CapitalPip Markets. All rights reserved.</p>
        </div>
      `,
    });

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password — consume token and set new password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const users = await db.users.findAll({ reset_token: token });
    const user = users[0] || null;

    if (!user || !user.reset_token_expires) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }
    if (Date.now() > user.reset_token_expires) {
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.users.update(user.id, { password: hashed, reset_token: null, reset_token_expires: null });

    res.json({ message: 'Password updated successfully. You can now sign in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (email !== process.env.ADMIN_EMAIL) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let user = (await db.users.findAll({ email: email.toLowerCase(), role: 'admin' }))[0] || null;

    if (!user) {
      if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
      const hashed = await bcrypt.hash(password, 12);
      user = await db.users.create({
        email: email.toLowerCase(), password: hashed,
        email_verified: 1, kyc_submitted: 1, verification_status: 'verified', role: 'admin',
      });
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
