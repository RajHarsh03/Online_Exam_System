const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/students — List all students (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:userId/results — Get a student's results (admin only)
router.get('/:userId/results', requireAdmin, async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.userId })
      .populate('exam', 'title subject totalMarks')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
