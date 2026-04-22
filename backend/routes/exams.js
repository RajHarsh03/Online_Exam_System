const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// ── Helper: generate unique exam access code ──
function generateCode(prefix, length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueExamCode() {
  let code, exists;
  do {
    code = generateCode('EXM');
    exists = await Exam.findOne({ accessCode: code });
  } while (exists);
  return code;
}

// ── Calculate expiry: scheduledDate + duration minutes ──
function calcExpiry(scheduledDate, durationMinutes) {
  if (!scheduledDate) return null;
  return new Date(new Date(scheduledDate).getTime() + durationMinutes * 60 * 1000);
}

// ────────────────────────────────────────────────────────────
// GET /api/exams — Admins: their own exams; Students: all published
// ────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    let filter;
    if (req.user.role === 'admin') {
      filter = { createdBy: req.user.id };
    } else {
      filter = { status: 'published' };
    }
    const exams = await Exam.find(filter).sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/exams/join — Student joins exam by access code
// ────────────────────────────────────────────────────────────
router.post('/join', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Exam code is required' });

    // 1. Find the exam by access code
    const exam = await Exam.findOne({ accessCode: code.toUpperCase().trim() }).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Invalid exam code. Please check and try again.' });

    // 2. Check expiry
    if (exam.expiresAt && new Date() > exam.expiresAt) {
      return res.status(410).json({ error: 'This exam code has expired. The exam has ended.' });
    }

    // 3. Must be published
    if (exam.status !== 'published') {
      return res.status(403).json({ error: 'This exam is not currently available.' });
    }

    // 4. Institution check — student must belong to the admin who created this exam
    if (req.user.role === 'student') {
      const User = require('../models/User');
      const student = await User.findById(req.user.id).select('linkedAdmin');
      if (!student) return res.status(401).json({ error: 'Student account not found.' });

      const studentAdmin = String(student.linkedAdmin);
      const examAdmin   = String(exam.createdBy);

      if (!student.linkedAdmin || studentAdmin !== examAdmin) {
        return res.status(403).json({
          error: 'This exam is not available for your institution. Please check the code with your instructor.',
        });
      }
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ────────────────────────────────────────────────────────────
// GET /api/exams/:id — Get exam details (admin must own; student can view published)
// ────────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    if (req.user.role === 'admin' && String(exam.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'student' && exam.status !== 'published') {
      return res.status(403).json({ error: 'Exam not available' });
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/exams — Create exam (admin only); auto-generate access code
// ────────────────────────────────────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const accessCode = await uniqueExamCode();
    const expiresAt = calcExpiry(req.body.scheduledDate, req.body.duration);

    const exam = new Exam({
      ...req.body,
      createdBy: req.user.id,
      accessCode,
      expiresAt,
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// PUT /api/exams/:id — Update exam (admin must own it)
// ────────────────────────────────────────────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!exam) return res.status(404).json({ error: 'Exam not found or access denied' });

    Object.assign(exam, req.body);
    // Recalculate expiry if scheduledDate or duration changed
    if (req.body.scheduledDate || req.body.duration) {
      exam.expiresAt = calcExpiry(
        req.body.scheduledDate || exam.scheduledDate,
        req.body.duration || exam.duration
      );
    }
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// DELETE /api/exams/:id — Delete exam (admin must own it)
// ────────────────────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!exam) return res.status(404).json({ error: 'Exam not found or access denied' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
