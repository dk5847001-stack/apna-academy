import mongoose from "mongoose";

const dsaProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    solvedProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DsaProblem" }],
    attemptedProblemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DsaProblem" }],
    totalSolved: { type: Number, default: 0, min: 0 },
    totalAttempted: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastPracticeDate: { type: Date, default: null },
    xp: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

dsaProgressSchema.index({ totalSolved: -1, xp: -1, longestStreak: -1, updatedAt: 1 });
dsaProgressSchema.index({ userId: 1, totalSolved: -1 });

const DsaProgress = mongoose.model("DsaProgress", dsaProgressSchema);
export default DsaProgress;
