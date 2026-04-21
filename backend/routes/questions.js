const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/questions — List questions (optionally by exam)
router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = req.query.exam ? { exam: req.query.exam } : {};
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/questions — Create question (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
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

// PUT /api/questions/:id — Update question (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/questions/:id — Delete question (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

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
