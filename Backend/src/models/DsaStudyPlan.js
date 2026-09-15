import mongoose from "mongoose";

const planDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DsaProblem" }],
  },
  { _id: false }
);

const dsaStudyPlanSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    durationDays: { type: Number, enum: [30, 60, 90], required: true, index: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    focus: [{ type: String, trim: true, maxlength: 80 }],
    days: [planDaySchema],
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

dsaStudyPlanSchema.index({ isPublished: 1, durationDays: 1, order: 1 });

const DsaStudyPlan = mongoose.model("DsaStudyPlan", dsaStudyPlanSchema);
export default DsaStudyPlan;
