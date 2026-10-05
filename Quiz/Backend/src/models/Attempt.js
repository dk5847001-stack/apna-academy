const mongoose = require('mongoose')

const snapshotOptionSchema = new mongoose.Schema({ key: String, text: String }, { _id: false })
const snapshotQuestionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  position: Number,
  text: String,
  options: [snapshotOptionSchema],
  correctOption: String,
  marks: Number,
  negativeMarks: Number,
}, { _id: false })

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
  answeredAt: { type: Date, default: null },
}, { _id: false })

const attemptSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizParticipant', required: true, index: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuiz', required: true, index: true },
  status: { type: String, enum: ['CREATED', 'STARTED', 'IN_PROGRESS', 'SUBMITTING', 'SUBMITTED', 'EXPIRED', 'ABANDONED', 'INVALIDATED'], default: 'CREATED', index: true },
  startedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  submittedAt: { type: Date, default: null },
  durationSeconds: { type: Number, required: true },
  snapshot: { type: [snapshotQuestionSchema], required: true },
  answers: { type: [answerSchema], default: [] },
  result: {
    score: Number,
    percentage: Number,
    correct: Number,
    incorrect: Number,
    skipped: Number,
    accuracy: Number,
    timeUsedSeconds: Number,
  },
}, { timestamps: true })

attemptSchema.index({ participantId: 1, quizId: 1, createdAt: -1 })

module.exports = mongoose.model('QuizAttempt', attemptSchema)
