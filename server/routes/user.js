const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendMail } = require('../mailer');
const auth = require('../middleware/auth');
const db = require('../db');
const { supabase } = require('../db');

const KYC_BUCKET = 'kyc-documents';

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.pdf'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
    cb(null, true);
  },
});


// Get profile
router.get('/profile', auth, (req, res) => {
  const u = req.user;
  res.json({
    id: u.id, email: u.email, full_name: u.full_name, phone: u.phone,
    address: u.address, kyc_submitted: !!u.kyc_submitted,
    verification_status: u.verification_status, balance: u.balance,
    role: u.role, created_at: u.created_at,
    nok_name: u.nok_name || null,
    nok_phone: u.nok_phone || null,
    nok_email: u.nok_email || null,
  });
});

// Submit KYC
router.post('/kyc', auth, upload.single('id_photo'), async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    if (!full_name || !phone || !address) return res.status(400).json({ error: 'All fields are required' });
    if (!req.file) return res.status(400).json({ error: 'Government ID photo is required' });

    // Delete previous document from Storage if one exists
    if (req.user.id_photo_path && req.user.id_photo_path.includes('/')) {
      await supabase.storage.from(KYC_BUCKET).remove([req.user.id_photo_path]);
    }

    // Upload new file to Supabase Storage
    const ext = path.extname(req.file.originalname).toLowerCase();
    const storagePath = `${req.user.id}/kyc_${Date.now()}${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(KYC_BUCKET)
      .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    await db.users.update(req.user.id, {
      full_name: full_name.trim(), phone: phone.trim(),
      address: address.trim(), id_photo_path: storagePath,
      kyc_submitted: 1, verification_status: 'pending',
    });

    res.json({ message: 'KYC submitted successfully. Your account is under review.' });
  } catch (err) {
    console.error('KYC error:', err);
    res.status(500).json({ error: 'KYC submission failed' });
  }
});

// Save / update next of kin
router.put('/next-of-kin', auth, async (req, res) => {
  try {
    const { nok_name, nok_phone, nok_email } = req.body;
    if (!nok_name || !nok_name.trim()) return res.status(400).json({ error: 'Next of kin name is required' });
    if (!nok_phone?.trim() && !nok_email?.trim()) {
      return res.status(400).json({ error: 'At least one contact method (phone or email) is required' });
    }

    await db.users.update(req.user.id, {
      nok_name: nok_name.trim(),
      nok_phone: nok_phone?.trim() || null,
      nok_email: nok_email?.trim() || null,
    });

    res.json({ message: 'Next of kin information saved.' });
  } catch (err) {
    console.error('Next of kin error:', err);
    res.status(500).json({ error: 'Failed to save next of kin' });
  }
});

// Get deposit addresses (served from backend only — never exposed in frontend source)
router.get('/deposit-addresses', auth, (req, res) => {
  res.json({
    addresses: [
      { crypto: 'BTC', network: 'Bitcoin', address: 'bc1q4cjjekh68utjcf5ldnddesxgtzq4f4glt7jxap', icon: 'btc' },
      { crypto: 'LTC', network: 'Litecoin', address: 'ltc1q2pjghyrwekjzz7w5quv8s729dcrkpusdcaxv94', icon: 'ltc' },
      { crypto: 'USDT', network: 'Tron (TRC20)', address: 'TRopvyFPb4Vc347o18oDMjbt9pD23WQiG2', icon: 'usdt' },
      { crypto: 'USDT', network: 'Ethereum (ERC20)', address: '0x78D5238F01022e723C4fde38aaa4bA3F4e7b2FfD', icon: 'usdt-eth' },
    ],
  });
});

// Notify deposit
router.post('/deposit', auth, async (req, res) => {
  try {
    const { crypto, network, amount, txid } = req.body;
    if (!crypto || !amount) return res.status(400).json({ error: 'Crypto and amount are required' });

    await db.deposits.create({
      user_id: req.user.id, crypto, network: network || '',
      amount: parseFloat(amount), txid: txid || null,
    });

    if (process.env.NOTIFY_EMAIL) {
      const u = req.user;
      const senderName = u.full_name || 'Not provided';
      const txLine = txid
        ? `<tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Transaction ID</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${txid}</td></tr>`
        : '';
      try {
        await sendMail({
          to: process.env.NOTIFY_EMAIL,
          subject: `New Deposit Notification — ${senderName} (${u.email})`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B1628;color:#fff;padding:40px;border-radius:12px;">
              <h1 style="color:#C9A84C;font-size:24px;margin:0 0 6px;">PrimePi Capital</h1>
              <p style="color:#8899AF;margin:0 0 30px;font-size:0.9rem;">Deposit Notification Received</p>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;width:40%;">Sender Name</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${senderName}</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Email Address</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${u.email}</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Amount</td><td style="padding:8px 0;color:#C9A84C;font-size:1rem;font-weight:700;">$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD equivalent</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Currency</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${crypto}</td></tr>
                <tr><td style="padding:8px 0;color:#8899AF;font-size:0.88rem;">Network</td><td style="padding:8px 0;color:#D4DCE8;font-size:0.88rem;">${network || '—'}</td></tr>
                ${txLine}
              </table>
              <hr style="border-color:rgba(201,168,76,0.2);margin:24px 0;" />
              <p style="color:#506070;font-size:0.78rem;text-align:center;">&copy; 2024 PrimePi Capital — Admin Notification</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Deposit notification email failed:', emailErr.message);
      }
    }

    res.json({ message: 'Deposit notification submitted. Funds will be credited after confirmation.' });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Failed to submit deposit notification' });
  }
});

// Request withdrawal (verified only)
router.post('/withdraw', auth, async (req, res) => {
  try {
    if (req.user.verification_status !== 'verified') {
      return res.status(403).json({ error: 'Account must be verified to make withdrawals.' });
    }
    const { amount, wallet_address, crypto } = req.body;
    if (!amount || !wallet_address || !crypto) return res.status(400).json({ error: 'Amount, wallet address, and crypto type are required' });
    if (parseFloat(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });

    await db.withdrawals.create({ user_id: req.user.id, amount: parseFloat(amount), wallet_address: wallet_address.trim(), crypto });
    res.json({ message: 'Withdrawal request submitted. Processing within 24-48 hours.' });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const [deposits, withdrawals, investments] = await Promise.all([
      db.deposits.findByUser(req.user.id),
      db.withdrawals.findByUser(req.user.id),
      db.investments.findByUser(req.user.id),
    ]);
    res.json({ deposits, withdrawals, investments });
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

// Delete account — removes all user data and KYC file
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove KYC file from Supabase Storage if it was uploaded there
    if (req.user.id_photo_path && req.user.id_photo_path.includes('/')) {
      await supabase.storage.from(KYC_BUCKET).remove([req.user.id_photo_path]);
    }

    // Delete all related records, then the user itself
    await Promise.all([
      db.deposits.deleteByUser(userId),
      db.withdrawals.deleteByUser(userId),
      db.investments.deleteByUser(userId),
    ]);
    await db.users.delete(userId);

    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
