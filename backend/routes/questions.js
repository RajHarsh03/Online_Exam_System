const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/questions — Admins see only their own questions; filter by exam optional
router.get('/', requireAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      filter.createdBy = req.user.id;
    }
    if (req.query.exam) {
      filter.exam = req.query.exam;
    }
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions — Create question (admin only, must own the exam)
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Verify the exam belongs to this admin if an exam is linked
    if (req.body.exam) {
      const exam = await Exam.findOne({ _id: req.body.exam, createdBy: req.user.id });
      if (!exam) return res.status(403).json({ error: 'Exam not found or access denied' });
    }

    const question = new Question({
      ...req.body,
      createdBy: req.user.id,
    });
    await question.save();

    // If linked to an exam, add question to exam's questions array
    if (req.body.exam) {
      await Exam.findByIdAndUpdate(req.body.exam, {
        $push: { questions: question._id },
      });
    }

    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/questions/:id — Update question (admin must own it)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!question) return res.status(404).json({ error: 'Question not found or access denied' });

    Object.assign(question, req.body);
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/questions/:id — Delete question (admin must own it)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!question) return res.status(404).json({ error: 'Question not found or access denied' });

    if (question.exam) {
      await Exam.findByIdAndUpdate(question.exam, {
        $pull: { questions: question._id },
      });
    }

    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
