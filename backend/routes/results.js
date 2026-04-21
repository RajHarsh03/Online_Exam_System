const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/results — Get results (students see own, admins see all)
router.get('/', requireAuth(), async (req, res) => {
  try {
    const role = req.auth?.sessionClaims?.metadata?.role;
    const filter = role === 'admin' ? {} : { student: req.auth.userId };

    if (req.query.exam) filter.exam = req.query.exam;

    const results = await Result.find(filter)
      .populate('exam', 'title subject totalMarks')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/results/:id — Get result details
router.get('/:id', requireAuth(), async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('exam')
      .populate('answers.question');

    if (!result) return res.status(404).json({ error: 'Result not found' });

    // Students can only view their own results
    const role = req.auth?.sessionClaims?.metadata?.role;
    if (role !== 'admin' && result.student !== req.auth.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/results — Submit exam (student)
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { examId, answers, timeTaken } = req.body;

    // Get exam with questions
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // Check if student already submitted
    const existing = await Result.findOne({ student: req.auth.userId, exam: examId });
    if (existing) return res.status(400).json({ error: 'Already submitted this exam' });

    // Grade the answers
    let obtainedMarks = 0;
    const gradedAnswers = answers.map(answer => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) return { ...answer, isCorrect: false, marksObtained: 0 };

      let isCorrect = false;
      if (question.type === 'mcq' || question.type === 'true_false') {
        isCorrect = question.options[answer.selectedOption]?.isCorrect || false;
      } else if (question.type === 'short_answer') {
        isCorrect = question.correctAnswer?.toLowerCase().trim() === answer.textAnswer?.toLowerCase().trim();
      }

      const marksObtained = isCorrect ? question.marks : 0;
      obtainedMarks += marksObtained;

      return {
        question: question._id,
        selectedOption: answer.selectedOption,
        textAnswer: answer.textAnswer,
        isCorrect,
        marksObtained,
      };
    });

    const percentage = Math.round((obtainedMarks / exam.totalMarks) * 100);

    const result = new Result({
      student: req.auth.userId,
      studentName: req.auth?.sessionClaims?.name || '',
      studentEmail: req.auth?.sessionClaims?.email || '',
      exam: examId,
      answers: gradedAnswers,
      totalMarks: exam.totalMarks,
      obtainedMarks,
      percentage,
      status: obtainedMarks >= exam.passingMarks ? 'passed' : 'failed',
      timeTaken,
    });

    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
