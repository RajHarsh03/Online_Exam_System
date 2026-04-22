const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/students — List all students (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email isActive createdAt')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/students/:id/status — Toggle student active/inactive (admin only)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ _id: student._id, isActive: student.isActive });
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

