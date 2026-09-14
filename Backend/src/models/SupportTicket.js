import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    senderType: { type: String, enum: ["user", "admin"], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: ["course", "payment", "video", "certificate", "account", "other"], default: "other", index: true },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    adminReply: { type: String, default: "", maxlength: 5000 },
    repliedAt: { type: Date, default: null },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    messages: { type: [supportMessageSchema], default: [] },
  },
  { timestamps: true }
);

supportTicketSchema.index({ user: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
supportTicketSchema.index({ assignedAdmin: 1, status: 1, updatedAt: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
