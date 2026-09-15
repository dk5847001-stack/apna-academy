import mongoose from "mongoose";

const dsaSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "DsaProblem", required: true, index: true },
    language: { type: String, enum: ["Java", "C++", "Python", "JavaScript"], required: true },
    code: { type: String, required: true, maxlength: 50000 },
    status: { type: String, enum: ["Pending", "Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "TLE", "MLE", "Runtime Limit", "Internal Error"], default: "Pending", index: true },
    passedTests: { type: Number, default: 0, min: 0 },
    totalTests: { type: Number, default: 0, min: 0 },
    executionTimeMs: { type: Number, default: null, min: 0 },
    memoryUsedMb: { type: Number, default: null, min: 0 },
    judgeMessage: { type: String, default: "", maxlength: 5000 },
  },
  { timestamps: true }
);

dsaSubmissionSchema.index({ userId: 1, createdAt: -1 });
dsaSubmissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

const DsaSubmission = mongoose.model("DsaSubmission", dsaSubmissionSchema);
export default DsaSubmission;
