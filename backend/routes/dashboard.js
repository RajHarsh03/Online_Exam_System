const express = require('express');
const router = express.Router();
const User    = require('../models/User');
const Exam    = require('../models/Exam');
const Question = require('../models/Question');
const Result  = require('../models/Result');
const { requireAdmin } = require('../middleware/auth');

// GET /api/dashboard — Aggregate stats scoped to the logged-in admin's institution
router.get('/', requireAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;

    // All counts/queries are scoped to THIS admin only
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
      // Only this admin's exams
      Exam.countDocuments({ createdBy: adminId }),
      Exam.countDocuments({ createdBy: adminId, status: 'published' }),
      Exam.countDocuments({ createdBy: adminId, status: 'draft' }),
      // Only students linked to this admin
      User.countDocuments({ role: 'student', linkedAdmin: adminId }),
      User.countDocuments({ role: 'student', linkedAdmin: adminId, isActive: true }),
      // Only questions created by this admin
      Question.countDocuments({ createdBy: adminId }),
      // Only results for this admin's exams (join via exam IDs)
      Result.countDocuments({ exam: { $in: await Exam.distinct('_id', { createdBy: adminId }) } }),
      // 5 most recent exams by this admin
      Exam.find({ createdBy: adminId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title subject status createdAt accessCode expiresAt'),
      // 5 most recently registered students of this admin
      User.find({ role: 'student', linkedAdmin: adminId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt isActive'),
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
