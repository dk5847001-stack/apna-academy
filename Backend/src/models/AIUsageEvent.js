import mongoose from "mongoose";

const aiUsageEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null, index: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "AIConversation", default: null, index: true },
    feature: {
      type: String,
      enum: ["chat", "course-chat", "explain", "summarize", "quiz", "study-plan", "code-review", "guest-chat", "embedding"],
      required: true,
      index: true,
    },
    audience: { type: String, enum: ["guest", "user", "admin"], required: true, index: true },
    provider: { type: String, default: "nvidia", maxlength: 50 },
    model: { type: String, default: "", maxlength: 200, index: true },
    requestChars: { type: Number, default: 0, min: 0 },
    inputTokens: { type: Number, default: 0, min: 0 },
    outputTokens: { type: Number, default: 0, min: 0 },
    totalTokens: { type: Number, default: 0, min: 0 },
    latencyMs: { type: Number, default: 0, min: 0 },
    success: { type: Boolean, required: true, index: true },
    statusCode: { type: Number, default: null },
    errorCode: { type: String, default: "", maxlength: 100 },
  },
  { timestamps: true }
);

aiUsageEventSchema.index({ createdAt: -1 });
aiUsageEventSchema.index({ user: 1, createdAt: -1 });
aiUsageEventSchema.index({ course: 1, createdAt: -1 });
aiUsageEventSchema.index({ feature: 1, success: 1, createdAt: -1 });

const AIUsageEvent = mongoose.model("AIUsageEvent", aiUsageEventSchema);
export default AIUsageEvent;
