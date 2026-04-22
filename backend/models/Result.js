const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName:  { type: String },
  studentEmail: { type: String },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [{
    question:       { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number },      // index of selected option for MCQ
    textAnswer:     { type: String },      // for short_answer
    isCorrect:      { type: Boolean },
    marksObtained:  { type: Number, default: 0 },
  }],
  totalMarks:    { type: Number },
  obtainedMarks: { type: Number },
  percentage:    { type: Number },
  rank:          { type: Number },         // rank within exam (1 = highest score)
  status: { type: String, enum: ['passed', 'failed'] },
  isPublished: { type: Boolean, default: false },   // admin must publish before student can view
  submittedAt: { type: Date, default: Date.now },
  timeTaken:   { type: Number },           // seconds
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
