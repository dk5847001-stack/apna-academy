import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIConversation",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
    sequence: {
      type: Number,
      required: true,
      min: 0,
    },
    model: {
      type: String,
      default: "",
      maxlength: 200,
    },
  },
  { timestamps: true }
);

aiMessageSchema.index({ conversation: 1, sequence: 1 }, { unique: true });
aiMessageSchema.index({ user: 1, conversation: 1, createdAt: 1 });

const AIMessage = mongoose.model("AIMessage", aiMessageSchema);
export default AIMessage;
