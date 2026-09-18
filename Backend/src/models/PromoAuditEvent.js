import mongoose from "mongoose";

const promoAuditEventSchema = new mongoose.Schema({
  promoCode: { type: mongoose.Schema.Types.ObjectId, ref: "PromoCode", default: null, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, enum: ["created","updated","activated","deactivated","deleted"], required: true, index: true },
  codeSnapshot: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
  changes: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

promoAuditEventSchema.index({ promoCode: 1, createdAt: -1 });
promoAuditEventSchema.index({ actor: 1, createdAt: -1 });
promoAuditEventSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("PromoAuditEvent", promoAuditEventSchema);
