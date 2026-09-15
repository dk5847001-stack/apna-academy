import mongoose from "mongoose";

const dsaEntitlementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    accessType: { type: String, enum: ["FREE", "PREMIUM", "ADMIN"], default: "FREE", index: true },
    source: { type: String, enum: ["DEFAULT", "DSA_SUBSCRIPTION", "ADMIN_GRANT"], default: "DEFAULT" },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

dsaEntitlementSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

const DsaEntitlement = mongoose.model("DsaEntitlement", dsaEntitlementSchema);
export default DsaEntitlement;
