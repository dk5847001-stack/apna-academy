import mongoose from "mongoose";

const aiConversationSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: "New AI chat",
      maxlength: 120,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

aiConversationSchema.index({ user: 1, course: 1, archivedAt: 1, updatedAt: -1 });
aiConversationSchema.index({ course: 1, updatedAt: -1 });
aiConversationSchema.index({ user: 1, lastMessageAt: -1 });

const AIConversation = mongoose.model("AIConversation", aiConversationSchema);
export default AIConversation;
