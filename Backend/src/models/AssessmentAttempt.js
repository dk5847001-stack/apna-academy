import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: false }
);

const assessmentAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true, index: true },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ user: 1, assessment: 1, createdAt: -1 });
assessmentAttemptSchema.index({ course: 1, passed: 1, createdAt: -1 });

const AssessmentAttempt = mongoose.model("AssessmentAttempt", assessmentAttemptSchema);
export default AssessmentAttempt;
