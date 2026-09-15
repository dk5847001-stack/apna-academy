import mongoose from "mongoose";

const dsaTestCaseSchema = new mongoose.Schema(
  {
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "DsaProblem", required: true, index: true },
    input: { type: String, required: true, maxlength: 10000 },
    expectedOutput: { type: String, required: true, maxlength: 10000 },
    isHidden: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dsaTestCaseSchema.index({ problemId: 1, order: 1 });

const DsaTestCase = mongoose.model("DsaTestCase", dsaTestCaseSchema);
export default DsaTestCase;
