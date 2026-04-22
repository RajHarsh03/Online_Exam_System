const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  scheduledDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ── Exam access code (students enter this to join) ──
  accessCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  // ── When the access code expires (scheduledDate + duration minutes) ──
  expiresAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Virtual: is the exam code still valid?
examSchema.virtual('isCodeActive').get(function () {
  if (!this.accessCode) return false;
  if (!this.expiresAt) return true; // no expiry set yet
  return new Date() < this.expiresAt;
});

module.exports = mongoose.model('Exam', examSchema);
