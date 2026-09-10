import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    certificateUrl: {
      type: String,
      default: "",
    },

    verificationUrl: {
      type: String,
      default: "",
    },

    qrCodeUrl: {
      type: String,
      default: "",
    },

    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model(
  "Certificate",
  certificateSchema
);

export default Certificate;