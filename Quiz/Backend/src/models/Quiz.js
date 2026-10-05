const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  type: { type: String, required: true, enum: ['Practice Quiz', 'Subject Test', 'Placement Test', 'Competitive Quiz', 'Mock Test', 'College Test', 'Certification Test', 'Live Quiz'] },
  degree: { type: String, required: true, trim: true },
  branch: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard', 'Mixed'] },
  durationSeconds: { type: Number, required: true, min: 60, max: 4 * 60 * 60 },
  marks: { type: Number, required: true, min: 1 },
  negativeMarks: { type: Number, default: 0, min: 0 },
  maxAttempts: { type: Number, default: 1, min: 1, max: 100 },
  passingPercentage: { type: Number, default: 40, min: 0, max: 100 },
  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  allowReview: { type: Boolean, default: true },
  showExplanations: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  resultMode: { type: String, enum: ['immediate', 'manual'], default: 'immediate' },
  tags: { type: [String], default: [] },
}, { timestamps: true })

quizSchema.index({ isPublished: 1, subject: 1, difficulty: 1 })

module.exports = mongoose.model('QuizQuiz', quizSchema)
