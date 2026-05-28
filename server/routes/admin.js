const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { supabase } = require('../db');
const { sendMail } = require('../mailer');
const PLANS = require('../plans');

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

// List all pending investment requests (with user info)
router.get('/investments/pending', auth, adminOnly, async (req, res) => {
  try {
    const investments = await db.investments.findAll({ status: 'pending' });
    const enriched = await Promise.all(investments.map(async inv => {
      const user = await db.users.findById(inv.user_id);
      return { ...inv, user_email: user?.email || '—', user_name: user?.full_name || '—' };
    }));
    res.json(enriched);
  } catch (err) {
    console.error('Admin investments error:', err);
    res.status(500).json({ error: 'Failed to load investments' });
  }
});

// Approve investment
router.put('/investments/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    await db.investments.update(req.params.id, { status: 'active' });
    res.json({ message: 'Investment approved' });
  } catch (err) {
    console.error('Approve investment error:', err);
    res.status(500).json({ error: 'Failed to approve investment' });
  }
});

// Reject investment
router.put('/investments/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    await db.investments.update(req.params.id, { status: 'rejected' });
    res.json({ message: 'Investment rejected' });
  } catch (err) {
    console.error('Reject investment error:', err);
    res.status(500).json({ error: 'Failed to reject investment' });
  }
});

// Assign plan directly to a user (admin-initiated, activates immediately, sends email)
router.post('/users/:id/assign-plan', auth, adminOnly, async (req, res) => {
  try {
    const { plan_name } = req.body;
    const plan = PLANS.find(p => p.name === plan_name);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    const user = await db.users.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ error: 'User not found' });

    // Cancel any existing active or pending investments
    const existing = await db.investments.findByUser(user.id);
    await Promise.all(
      existing
        .filter(i => ['active', 'pending'].includes(i.status))
        .map(i => db.investments.update(i.id, { status: 'cancelled' }))
    );

    await db.investments.create({
      user_id: user.id,
      plan_name: plan.name,
      amount: user.balance || 0,
      roi_min: plan.roi_min,
      roi_max: plan.roi_max,
      profit_fee: plan.profit_fee,
      status: 'active',
    });

    // Notify user by email
    try {
      await sendMail({
        to: user.email,
        subject: 'Your Investment Plan Has Been Updated — CapitalPip Markets',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B1628;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#C9A84C;font-size:24px;margin:0 0 6px;">CapitalPip Markets</h1>
            <p style="color:#8899AF;margin:0 0 30px;font-size:0.9rem;">Investment Plan Update</p>
            <p style="color:#D4DCE8;line-height:1.6;">Hi ${user.full_name || 'Investor'},</p>
            <p style="color:#D4DCE8;line-height:1.6;">Your investment plan has been updated by our team. Here are your new plan details:</p>
            <div style="background:#0F2240;border:1px solid rgba(201,168,76,0.25);border-radius:8px;padding:20px;margin:24px 0;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;width:40%;">Plan</td><td style="padding:8px 0;color:#C9A84C;font-size:1rem;font-weight:700;">${plan.name}</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Bi-Weekly ROI</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${plan.roi_min}% – ${plan.roi_max}%</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Profit Fee</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${plan.profit_fee}%</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Status</td><td style="padding:8px 0;color:#22c55e;font-size:0.88rem;font-weight:600;">Active</td></tr>
              </table>
            </div>
            <p style="color:#D4DCE8;line-height:1.6;">Log in to your dashboard to view your updated investment details.</p>
            <hr style="border-color:rgba(201,168,76,0.2);margin:24px 0;" />
            <p style="color:#506070;font-size:0.78rem;text-align:center;">&copy; 2024 CapitalPip Markets. All rights reserved.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Plan assignment email failed:', emailErr.message);
    }

    res.json({ message: `${plan.name} plan assigned to ${user.email}` });
  } catch (err) {
    console.error('Assign plan error:', err);
    res.status(500).json({ error: 'Failed to assign plan' });
  }
});

module.exports = router;
