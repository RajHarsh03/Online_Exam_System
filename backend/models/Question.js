const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
  options: [{
    text: { type: String },
    isCorrect: { type: Boolean, default: false },
  }],
  correctAnswer: { type: String }, // for short_answer type
  marks: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  subject: { type: String },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
