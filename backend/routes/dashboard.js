const express = require('express');
const router = express.Router();
const User    = require('../models/User');
const Exam    = require('../models/Exam');
const Question = require('../models/Question');
const Result  = require('../models/Result');
const { requireAdmin } = require('../middleware/auth');

// GET /api/dashboard — Aggregate stats for admin dashboard
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [
      totalExams,
      publishedExams,
      draftExams,
      totalStudents,
      activeStudents,
      totalQuestions,
      totalResults,
      recentExams,
      recentStudents,
    ] = await Promise.all([
      Exam.countDocuments(),
      Exam.countDocuments({ status: 'published' }),
      Exam.countDocuments({ status: 'draft' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      Question.countDocuments(),
      Result.countDocuments(),
      // 5 most recently created exams
      Exam.find().sort({ createdAt: -1 }).limit(5).select('title subject status createdAt'),
      // 5 most recently registered students
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt isActive'),
    ]);

    res.json({
      stats: {
        totalExams,
        publishedExams,
        draftExams,
        totalStudents,
        activeStudents,
        totalQuestions,
        totalResults,
      },
      recentExams,
      recentStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
