const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { supabase } = require('../db');

const KYC_BUCKET = 'kyc-documents';

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Get all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = (await db.users.findAll({ role: { $ne: 'admin' } })).map(u => ({
      id: u.id, email: u.email, full_name: u.full_name, phone: u.phone,
      kyc_submitted: u.kyc_submitted, verification_status: u.verification_status,
      balance: u.balance, created_at: u.created_at, email_verified: u.email_verified,
    }));
    res.json(users);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// Get single user details
router.get('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ error: 'User not found' });
    const [deposits, withdrawals] = await Promise.all([
      db.deposits.findByUser(user.id),
      db.withdrawals.findByUser(user.id),
    ]);
    res.json({ user, deposits, withdrawals });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// Update verification status
router.put('/users/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await db.users.update(req.params.id, { verification_status: status });
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error('Admin status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update deposit status
router.put('/deposits/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await db.deposits.update(req.params.id, { status });
    if (status === 'confirmed') {
      const deposit = await db.deposits.findById(req.params.id);
      if (deposit && deposit.amount) {
        const user = await db.users.findById(deposit.user_id);
        if (user) await db.users.update(deposit.user_id, { balance: (user.balance || 0) + deposit.amount });
      }
    }
    res.json({ message: 'Deposit status updated' });
  } catch (err) {
    console.error('Admin deposit update error:', err);
    res.status(500).json({ error: 'Failed to update deposit' });
  }
});

// Update user balance
router.put('/users/:id/balance', auth, adminOnly, async (req, res) => {
  try {
    const balance = parseFloat(req.body.balance);
    if (isNaN(balance) || balance < 0) return res.status(400).json({ error: 'Invalid balance amount' });
    await db.users.update(req.params.id, { balance });
    res.json({ message: 'Balance updated' });
  } catch (err) {
    console.error('Admin balance update error:', err);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Update withdrawal status
router.put('/withdrawals/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    await db.withdrawals.update(req.params.id, { status });
    res.json({ message: 'Withdrawal status updated' });
  } catch (err) {
    console.error('Admin withdrawal update error:', err);
    res.status(500).json({ error: 'Failed to update withdrawal' });
  }
});

// Dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [totalUsers, pendingKyc, verified, pendingDeposits, pendingWithdrawals] = await Promise.all([
      db.users.count({ role: { $ne: 'admin' } }),
      db.users.count({ verification_status: 'pending' }),
      db.users.count({ verification_status: 'verified' }),
      db.deposits.count({ status: 'pending' }),
      db.withdrawals.count({ status: 'pending' }),
    ]);
    res.json({ totalUsers, pendingKyc, verified, pendingDeposits, pendingWithdrawals });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// Generate short-lived signed URL for a user's KYC document
router.get('/users/:id/kyc-url', auth, adminOnly, async (req, res) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user || !user.id_photo_path) {
      return res.status(404).json({ error: 'No KYC document on file' });
    }
    const { data, error } = await supabase.storage
      .from(KYC_BUCKET)
      .createSignedUrl(user.id_photo_path, 300); // expires in 5 minutes
    if (error) throw new Error(error.message);
    res.json({ url: data.signedUrl, path: user.id_photo_path });
  } catch (err) {
    console.error('KYC URL error:', err);
    res.status(500).json({ error: 'Failed to generate document URL' });
  }
});

module.exports = router;
