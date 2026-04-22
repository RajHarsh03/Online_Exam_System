const express = require('express');
const router = express.Router();
const Result   = require('../models/Result');
const Exam     = require('../models/Exam');
const Question = require('../models/Question');
const User     = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// ── Helper: recompute & save ranks for all results in an exam ──
async function recomputeRanks(examId) {
  const results = await Result.find({ exam: examId }).sort({ obtainedMarks: -1, submittedAt: 1 });
  for (let i = 0; i < results.length; i++) {
    results[i].rank = i + 1;
    await results[i].save();
  }
}

// ── GET /api/results — list results (students see own; admins see all) ──
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { student: req.user.id };
    if (req.query.exam) filter.exam = req.query.exam;

    const results = await Result.find(filter)
      .populate('exam',    'title subject totalMarks passingMarks')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/results/stats — aggregate stats for admin results overview ──
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const total  = await Result.countDocuments();
    const passed = await Result.countDocuments({ status: 'passed' });
    const failed = await Result.countDocuments({ status: 'failed' });

    // Average percentage across all results
    const avgAgg = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: '$percentage' } } }
    ]);
    const avgScore = avgAgg[0] ? Math.round(avgAgg[0].avg) : 0;
    const passRate = total ? Math.round((passed / total) * 100) : 0;

    res.json({ total, passed, failed, avgScore, passRate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/results/leaderboard/:examId — ranked results for one exam ──
router.get('/leaderboard/:examId', requireAdmin, async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate('student', 'name email')
      .sort({ obtainedMarks: -1, submittedAt: 1 });

    // Attach rank on the fly
    const ranked = results.map((r, i) => ({
      rank:         i + 1,
      studentName:  r.student?.name  || r.studentName  || 'Unknown',
      studentEmail: r.student?.email || r.studentEmail || '',
      obtainedMarks: r.obtainedMarks,
      totalMarks:    r.totalMarks,
      percentage:    r.percentage,
      status:        r.status,
      submittedAt:   r.submittedAt,
      timeTaken:     r.timeTaken,
      resultId:      r._id,
    }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/results/:id — single result detail ──
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('exam')
      .populate('student', 'name email')
      .populate('answers.question');

    if (!result) return res.status(404).json({ error: 'Result not found' });

    // Students can only see their own
    if (req.user.role !== 'admin' && result.student._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/results — submit & auto-evaluate exam (student) ──
router.post('/', requireAuth, async (req, res) => {
  try {
    const { examId, answers, timeTaken } = req.body;

    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // Prevent duplicate submission
    const existing = await Result.findOne({ student: req.user.id, exam: examId });
    if (existing) return res.status(400).json({ error: 'You have already submitted this exam' });

    // ── Auto-grade each answer ──
    let obtainedMarks = 0;
    const gradedAnswers = (answers || []).map(answer => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return { question: answer.questionId, isCorrect: false, marksObtained: 0 };

      let isCorrect = false;
      if (question.type === 'mcq' || question.type === 'true_false') {
        isCorrect = question.options[answer.selectedOption]?.isCorrect === true;
      } else if (question.type === 'short_answer') {
        isCorrect =
          question.correctAnswer?.toLowerCase().trim() ===
          answer.textAnswer?.toLowerCase().trim();
      }

      const marksObtained = isCorrect ? question.marks : 0;
      obtainedMarks += marksObtained;

      return {
        question:       question._id,
        selectedOption: answer.selectedOption,
        textAnswer:     answer.textAnswer,
        isCorrect,
        marksObtained,
      };
    });

    const percentage  = exam.totalMarks ? Math.round((obtainedMarks / exam.totalMarks) * 100) : 0;
    const status      = obtainedMarks >= exam.passingMarks ? 'passed' : 'failed';

    // Fetch student info for denormalised fields
    const studentDoc  = await User.findById(req.user.id).select('name email');

    const result = await Result.create({
      student:      req.user.id,
      studentName:  studentDoc?.name  || req.user.name  || '',
      studentEmail: studentDoc?.email || req.user.email || '',
      exam:         examId,
      answers:      gradedAnswers,
      totalMarks:   exam.totalMarks,
      obtainedMarks,
      percentage,
      status,
      timeTaken,
    });

    // Recompute ranks for this exam after new submission
    await recomputeRanks(examId);
    await result.reload?.();    // mongoose v6+
    // Fetch the updated result with rank
    const saved = await Result.findById(result._id)
      .populate('exam', 'title subject')
      .populate('student', 'name email');

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
