import mongoose from "mongoose";

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      maxlength: 200,
    },
    event: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const RazorpayWebhookEvent = mongoose.model(
  "RazorpayWebhookEvent",
  razorpayWebhookEventSchema
);

export default RazorpayWebhookEvent;
