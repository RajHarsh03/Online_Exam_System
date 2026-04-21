const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/exams — List all published exams (students) or all exams (admin)
router.get('/', requireAuth(), async (req, res) => {
  try {
    const role = req.auth?.sessionClaims?.metadata?.role;
    const filter = role === 'admin' ? {} : { status: 'published' };
    const exams = await Exam.find(filter).sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/exams/:id — Get exam details
router.get('/:id', requireAuth(), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exams — Create exam (admin only)
router.post('/', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const exam = new Exam({
      ...req.body,
      createdBy: req.auth.userId,
    });
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/exams/:id — Update exam (admin only)
router.put('/:id', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/exams/:id — Delete exam (admin only)
router.delete('/:id', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
