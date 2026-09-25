import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  question: { type: String, required: true, maxlength: 2000 },
  category: { type: String, required: true, maxlength: 100 },
  answer: { type: String, required: true, maxlength: 10000 },
  score: { type: Number, min: 0, max: 100, default: null },
  feedback: { type: String, maxlength: 2000, default: "" },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  submittedAt: { type: Date, default: Date.now },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  setup: {
    role: { type: String, required: true, trim: true, maxlength: 80 },
    interviewType: { type: String, enum: ["technical", "dsa", "behavioral"], required: true },
    experience: { type: String, required: true, maxlength: 50 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    durationMinutes: { type: Number, min: 5, max: 180, required: true },
    questionCount: { type: Number, min: 1, max: 30, required: true },
  },
  questions: [{
    id: { type: String, required: true },
    category: { type: String, required: true, maxlength: 100 },
    question: { type: String, required: true, maxlength: 2000 },
    hint: { type: String, maxlength: 500, default: "" },
    isFollowUp: { type: Boolean, default: false },
    parentQuestionId: { type: String, default: "" },
  }],
  answers: { type: [answerSchema], default: [] },
  status: { type: String, enum: ["active", "completed", "expired"], default: "active", index: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  result: {
    overallScore: { type: Number, min: 0, max: 100, default: null },
    technical: { type: Number, min: 0, max: 100, default: null },
    communication: { type: Number, min: 0, max: 100, default: null },
    confidence: { type: Number, min: 0, max: 100, default: null },
    problemSolving: { type: Number, min: 0, max: 100, default: null },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    summary: { type: String, maxlength: 4000, default: "" },
  },
}, { timestamps: true });

interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model("InterviewSession", interviewSessionSchema);
