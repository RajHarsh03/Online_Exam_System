const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, requireAuth } = require('../middleware/auth');

// ── Helper: generate a unique alphanumeric code ──
function generateCode(prefix, length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed ambiguous chars
  let code = prefix + '-';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueInstituteCode() {
  let code, exists;
  do {
    code = generateCode('INS');
    exists = await User.findOne({ instituteCode: code });
  } while (exists);
  return code;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, instituteCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const isAdmin = role === 'admin';

    // Students must provide a valid institute code
    let linkedAdmin = null;
    if (!isAdmin) {
      if (!instituteCode) {
        return res.status(400).json({ error: 'Institute code is required for student registration' });
      }
      const admin = await User.findOne({ instituteCode: instituteCode.toUpperCase().trim(), role: 'admin' });
      if (!admin) {
        return res.status(400).json({ error: 'Invalid institute code. Please check with your administrator.' });
      }
      linkedAdmin = admin._id;
    }

    const userData = {
      name,
      email,
      password,
      role: isAdmin ? 'admin' : 'student',
      linkedAdmin,
    };

    // Auto-generate unique institute code for admins
    if (isAdmin) {
      userData.instituteCode = await uniqueInstituteCode();
    }

    const user = await User.create(userData);
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Block deactivated accounts (isActive: false means explicitly deactivated)
    // undefined means field not yet set → treat as active (backward compat)
    if (user.isActive !== undefined && user.isActive !== true) {
      console.log(`[AUTH] Blocked login for deactivated account: ${user.email}`);
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact the administrator.' });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me — get current user profile (includes instituteCode for admins)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
