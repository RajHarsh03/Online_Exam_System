const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: String, required: true }, // Clerk user ID
  studentName: { type: String },
  studentEmail: { type: String },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number }, // index of selected option
    textAnswer: { type: String },    // for short_answer
    isCorrect: { type: Boolean },
    marksObtained: { type: Number, default: 0 },
  }],
  totalMarks: { type: Number },
  obtainedMarks: { type: Number },
  percentage: { type: Number },
  status: { type: String, enum: ['passed', 'failed'], },
  submittedAt: { type: Date, default: Date.now },
  timeTaken: { type: Number }, // in seconds
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
