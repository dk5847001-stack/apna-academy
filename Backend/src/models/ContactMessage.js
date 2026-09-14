import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "read", "replied", "closed"], default: "new", index: true },
    adminReply: { type: String, default: "", maxlength: 5000 },
    repliedAt: { type: Date, default: null },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema);
