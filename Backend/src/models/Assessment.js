import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 1000 },
    options: {
      type: [optionSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2 && value.length <= 6,
        message: "Each question must have 2 to 6 options.",
      },
    },
    correctOptionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    marks: { type: Number, default: 1, min: 1, max: 100 },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    passingScore: { type: Number, default: 60, min: 1, max: 100 },
    maxAttempts: { type: Number, default: 3, min: 1, max: 20 },
    questions: { type: [questionSchema], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

assessmentSchema.index({ course: 1, isPublished: 1 });

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
