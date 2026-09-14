import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
    status: { type: String, enum: ["active", "unsubscribed"], default: "active", index: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriberSchema.index({ createdAt: -1 });
subscriberSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Subscriber", subscriberSchema);
