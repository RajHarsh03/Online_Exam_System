const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/students — List all students who have taken exams (admin only)
router.get('/', requireAuth(), requireAdmin, async (req, res) => {
  try {
    // Aggregate unique students from results
    const students = await Result.aggregate([
      {
        $group: {
          _id: '$student',
          name: { $first: '$studentName' },
          email: { $first: '$studentEmail' },
          totalExams: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
          lastExam: { $max: '$submittedAt' },
        }
      },
      { $sort: { lastExam: -1 } }
    ]);

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:userId/results — Get a student's results (admin only)
router.get('/:userId/results', requireAuth(), requireAdmin, async (req, res) => {
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
