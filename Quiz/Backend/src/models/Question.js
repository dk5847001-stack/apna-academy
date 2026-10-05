const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuiz', required: true, index: true },
  position: { type: Number, required: true, min: 1 },
  topic: { type: String, trim: true, maxlength: 120, default: '' },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  options: {
    type: [{
      key: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
      text: { type: String, required: true, trim: true, maxlength: 500 },
    }],
    validate: { validator: (value) => value.length >= 2 && value.length <= 4, message: 'A question must have 2 to 4 options.' },
  },
  correctOption: { type: String, required: true, enum: ['A', 'B', 'C', 'D'] },
  marks: { type: Number, default: 1, min: 0 },
  explanation: { type: String, trim: true, maxlength: 1500, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

questionSchema.index({ quizId: 1, position: 1 }, { unique: true })

module.exports = mongoose.model('QuizQuestion', questionSchema)
