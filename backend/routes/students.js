const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/students — List only students linked to this admin's institution
router.get('/', requireAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', linkedAdmin: req.user.id })
      .select('name email isActive createdAt')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/students/:id/status — Toggle active/inactive (admin can only toggle their own students)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      linkedAdmin: req.user.id,   // Must belong to this admin
    });
    if (!student) return res.status(404).json({ error: 'Student not found or access denied' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ _id: student._id, isActive: student.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:userId/results — Get a student's results (only if student belongs to this admin)
router.get('/:userId/results', requireAdmin, async (req, res) => {
  try {
    // Verify the student belongs to this admin
    const student = await User.findOne({
      _id: req.params.userId,
      role: 'student',
      linkedAdmin: req.user.id,
    });
    if (!student) return res.status(403).json({ error: 'Access denied' });

    const results = await Result.find({ student: req.params.userId })
      .populate('exam', 'title subject totalMarks')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
