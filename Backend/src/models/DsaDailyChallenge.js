import mongoose from "mongoose";

const dsaDailyChallengeSchema = new mongoose.Schema(
  {
    challengeDate: { type: Date, required: true, unique: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "DsaProblem", required: true, index: true },
    title: { type: String, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

dsaDailyChallengeSchema.index({ challengeDate: 1, isActive: 1 });

const DsaDailyChallenge = mongoose.model("DsaDailyChallenge", dsaDailyChallengeSchema);
export default DsaDailyChallenge;
