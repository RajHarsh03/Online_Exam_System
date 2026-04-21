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
  createdBy: { type: String, required: true }, // Clerk user ID
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
