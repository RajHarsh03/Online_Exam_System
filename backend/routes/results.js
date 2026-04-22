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

// ── GET /api/results — list results (students see own; admins see student-only) ──
router.get('/', requireAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'admin') {
      // Only return results submitted by actual students (not admin test submissions)
      const studentIds = await User.find({ role: 'student' }).distinct('_id');
      filter.student = { $in: studentIds };
    } else {
      // Student sees only their OWN PUBLISHED results
      filter.student = req.user.id;
      filter.isPublished = true;
    }

    if (req.query.exam) filter.exam = req.query.exam;

    const results = await Result.find(filter)
      .populate('exam',    'title subject totalMarks passingMarks duration')
      .populate('student', 'name email role')
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/results/stats — aggregate stats for admin results overview ──
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Only count real student submissions
    const studentIds = await User.find({ role: 'student' }).distinct('_id');
    const studentFilter = { student: { $in: studentIds } };

    const total  = await Result.countDocuments(studentFilter);
    const passed = await Result.countDocuments({ ...studentFilter, status: 'passed' });
    const failed = await Result.countDocuments({ ...studentFilter, status: 'failed' });

    const avgAgg = await Result.aggregate([
      { $match: { student: { $in: studentIds } } },
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
    // Only rank actual students, not admin test submissions
    const studentIds = await User.find({ role: 'student' }).distinct('_id');

    const results = await Result.find({
      exam: req.params.examId,
      student: { $in: studentIds },
    })
      .populate('student', 'name email')
      .sort({ obtainedMarks: -1, submittedAt: 1 });

    const ranked = results.map((r, i) => ({
      rank:         i + 1,
      studentName:  r.student?.name  || r.studentName  || 'Unknown',
      studentEmail: r.student?.email || r.studentEmail || '',
      obtainedMarks: r.obtainedMarks,
      totalMarks:    r.totalMarks,
      percentage:    r.percentage,
      status:        r.status,
      isPublished:   r.isPublished,
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

// ── PATCH /api/results/:id/publish — admin publishes a single result ──
router.patch('/:id/publish', requireAdmin, async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    ).populate('exam', 'title').populate('student', 'name email');
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/results/publish-all — admin bulk-publishes all results (optional ?exam=id filter) ──
router.patch('/publish-all', requireAdmin, async (req, res) => {
  try {
    const studentIds = await User.find({ role: 'student' }).distinct('_id');
    const filter = { student: { $in: studentIds }, isPublished: false };
    if (req.query.exam) filter.exam = req.query.exam;

    const updated = await Result.updateMany(filter, { isPublished: true });
    res.json({ published: updated.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
