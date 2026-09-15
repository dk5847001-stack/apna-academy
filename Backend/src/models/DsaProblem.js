import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true, trim: true, maxlength: 5000 },
    output: { type: String, required: true, trim: true, maxlength: 5000 },
    explanation: { type: String, default: "", trim: true, maxlength: 5000 },
  },
  { _id: false }
);

const dsaProblemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 20000 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true, index: true },
    topics: [{ type: String, trim: true, maxlength: 80 }],
    companies: [{ type: String, trim: true, maxlength: 80 }],
    patterns: [{ type: String, trim: true, maxlength: 80 }],
    constraints: [{ type: String, trim: true, maxlength: 1000 }],
    examples: [exampleSchema],
    hints: [{ type: String, trim: true, maxlength: 5000 }],
    editorial: { type: String, default: "", maxlength: 20000 },
    solution: { type: String, default: "", maxlength: 30000 },
    starterCode: { type: Map, of: String, default: {} },
    supportedLanguages: [{ type: String, enum: ["Java", "C++", "Python", "JavaScript"] }],
    testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: "DsaTestCase" }],
    timeLimitMs: { type: Number, min: 100, max: 30000, default: 2000 },
    memoryLimitMb: { type: Number, min: 16, max: 2048, default: 256 },
    isPremium: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"], default: "DRAFT", index: true },
  },
  { timestamps: true }
);

dsaProblemSchema.index({ status: 1, isPremium: 1, order: 1 });
dsaProblemSchema.index({ difficulty: 1, status: 1, order: 1 });
dsaProblemSchema.index({ topics: 1, status: 1 });
dsaProblemSchema.index({ companies: 1, status: 1 });

dsaProblemSchema.index({ title: "text", slug: "text", topics: "text", companies: "text" });

const DsaProblem = mongoose.model("DsaProblem", dsaProblemSchema);
export default DsaProblem;
