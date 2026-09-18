import ReferralPayoutDestination from "../models/ReferralPayoutDestination.js";
import ReferralAuditEvent from "../models/ReferralAuditEvent.js";
import User from "../models/User.js";
import {
  ensureFundAccount,
  validateFundAccount,
  fetchFundAccountValidation,
} from "./razorpayX.service.js";
import { isRazorpayXEnabled } from "../config/razorpayX.js";
import { encryptPayoutSecret } from "../utils/payoutSecret.js";
import crypto from "crypto";

const fail = (message, statusCode = 400, code = "PAYOUT_DESTINATION_ERROR") =>
  Object.assign(new Error(message), { statusCode, code });

const normalize = ({ method, upiId, accountHolderName, accountNumber, ifsc }) => {
  const normalizedMethod = String(method || "").trim().toLowerCase();
  const name = String(accountHolderName || "").trim().replace(/\s+/g, " ");

  if (!["upi", "bank"].includes(normalizedMethod)) {
    throw fail("Invalid payout method.", 400, "INVALID_PAYOUT_METHOD");
  }
  if (!/^[A-Za-z][A-Za-z .'-]{1,119}$/.test(name)) {
    throw fail("Invalid account holder name.", 400, "INVALID_ACCOUNT_HOLDER_NAME");
  }

  if (normalizedMethod === "upi") {
    const value = String(upiId || "").trim().toLowerCase();
    if (!/^[a-z0-9._-]{2,100}@[a-z]{2,64}$/.test(value)) {
      throw fail("Invalid UPI ID.", 400, "INVALID_UPI_ID");
    }
    return { method: "upi", accountHolderName: name, upiId: value };
  }

  const account = String(accountNumber || "").replace(/\s+/g, "");
  const code = String(ifsc || "").trim().toUpperCase();

  if (!/^\d{9,18}$/.test(account)) {
    throw fail("Invalid bank account number.", 400, "INVALID_BANK_ACCOUNT");
  }
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) {
    throw fail("Invalid IFSC code.", 400, "INVALID_IFSC");
  }

  return {
    method: "bank",
    accountHolderName: name,
    accountNumber: account,
    accountNumberLast4: account.slice(-4),
    ifsc: code,
  };
};

const maskUpi = (upiId) => {
  const [name, handle] = String(upiId).split("@");
  return (name.length <= 2 ? "*".repeat(name.length) : name[0] + "****" + name.slice(-1)) + "@" + handle;
};

const publicDestination = (doc) => ({
  method: doc.method,
  accountHolderName: doc.accountHolderName,
  maskedUPI: doc.method === "upi" && doc.upiId ? maskUpi(doc.upiId) : null,
  maskedAccountNumber:
    doc.method === "bank" && doc.accountNumberLast4
      ? "******" + doc.accountNumberLast4
      : null,
  ifsc: doc.method === "bank" ? doc.ifsc : null,
  verificationStatus: doc.verificationStatus,
  verificationRegisteredName: doc.verificationRegisteredName,
  verificationNameMatchScore: doc.verificationNameMatchScore,
  verifiedAt: doc.verifiedAt,
});

const audit = async ({ user, action, metadata = {} }) => {
  await ReferralAuditEvent.create({
    user,
    action,
    metadata,
    correlationId: "referral_destination_" + crypto.randomUUID(),
  });
};

export const getMyReferralPayoutDestination = async (userId) => {
  const destination = await ReferralPayoutDestination.findOne({ user: userId });
  return destination ? publicDestination(destination) : null;
};

export const saveReferralPayoutDestination = async ({ userId, ...input }) => {
  if (!isRazorpayXEnabled) {
    throw fail("RazorpayX payout verification is not enabled.", 503, "RAZORPAYX_DISABLED");
  }

  const user = await User.findById(userId).select("_id name email phone status isEmailVerified");
  if (!user) throw fail("User not found.", 404, "USER_NOT_FOUND");
  if (user.status !== "active") throw fail("Account is not active.", 403, "ACCOUNT_INACTIVE");
  if (!user.isEmailVerified) throw fail("Email verification is required.", 403, "EMAIL_NOT_VERIFIED");

  const destination = normalize(input);
  const provider = await ensureFundAccount({
    user,
    destination,
    providerContactId: null,
    providerFundAccountId: null,
  });

  let record = await ReferralPayoutDestination.findOne({ user: userId })
    .select("+providerContactId +providerFundAccountId +encryptedProviderContactId +encryptedProviderFundAccountId +encryptedUpiId");

  const changed =
    !record ||
    record.method !== destination.method ||
    record.accountHolderName !== destination.accountHolderName ||
    record.accountNumberLast4 !== (destination.accountNumberLast4 || null) ||
    record.ifsc !== (destination.ifsc || null) ||
    (record.method === "upi" && record.upiId !== destination.upiId);

  if (!record) record = new ReferralPayoutDestination({ user: userId });

  record.method = destination.method;
  record.accountHolderName = destination.accountHolderName;
  record.upiId = destination.method === "upi" ? destination.upiId : null;
  record.encryptedUpiId = destination.method === "upi" ? encryptPayoutSecret(destination.upiId) : null;
  record.accountNumberLast4 = destination.accountNumberLast4 || null;
  record.ifsc = destination.ifsc || null;
  record.providerContactId = provider.providerContactId;
  record.encryptedProviderContactId = encryptPayoutSecret(provider.providerContactId);
  record.providerFundAccountId = provider.providerFundAccountId;
  record.encryptedProviderFundAccountId = encryptPayoutSecret(provider.providerFundAccountId);

  if (changed) {
    record.verificationStatus = "unverified";
    record.verificationId = null;
    record.verificationReferenceId = null;
    record.verificationRegisteredName = null;
    record.verificationNameMatchScore = null;
    record.verificationFailureReason = null;
    record.verifiedAt = null;
  }

  await record.save();

  await audit({
    user: userId,
    action: "payout_destination_updated",
    metadata: {
      method: destination.method,
      verificationStatus: record.verificationStatus,
    },
  });

  return publicDestination(record);
};

export const verifyMyReferralPayoutDestination = async (userId) => {
  if (!isRazorpayXEnabled) {
    throw fail("RazorpayX payout verification is not enabled.", 503, "RAZORPAYX_DISABLED");
  }

  const record = await ReferralPayoutDestination.findOne({ user: userId })
    .select("+providerFundAccountId +verificationId");
  if (!record) throw fail("Payout destination not found.", 404, "PAYOUT_DESTINATION_NOT_FOUND");
  if (!record.providerFundAccountId) throw fail("Payout destination is not linked to RazorpayX.", 409, "PAYOUT_DESTINATION_NOT_READY");

  const referenceId = "AA-VER-" + crypto.randomUUID().replace(/-/g, "").slice(0, 28);
  const provider = await validateFundAccount({
    providerFundAccountId: record.providerFundAccountId,
    referenceId,
    validationType: "pennydrop",
  });

  record.verificationId = provider.verificationId;
  record.verificationReferenceId = provider.verificationReferenceId || referenceId;
  record.verificationRegisteredName = provider.registeredName;
  record.verificationNameMatchScore = provider.nameMatchScore;
  record.verificationFailureReason = provider.failureReason;
  record.verificationStatus =
    provider.verificationStatus === "completed"
      ? "verified"
      : provider.verificationStatus === "failed"
        ? "failed"
        : "pending";
  record.verifiedAt = record.verificationStatus === "verified" ? new Date() : null;
  await record.save();

  await audit({
    user: userId,
    action: "payout_destination_verification_started",
    metadata: {
      method: record.method,
      verificationStatus: record.verificationStatus,
    },
  });

  return publicDestination(record);
};

export const refreshMyReferralPayoutDestinationVerification = async (userId) => {
  if (!isRazorpayXEnabled) {
    throw fail("RazorpayX payout verification is not enabled.", 503, "RAZORPAYX_DISABLED");
  }

  const record = await ReferralPayoutDestination.findOne({ user: userId })
    .select("+verificationId");
  if (!record?.verificationId) {
    throw fail("No verification transaction is available.", 404, "VERIFICATION_NOT_FOUND");
  }

  const provider = await fetchFundAccountValidation(record.verificationId);
  record.verificationStatus =
    provider.verificationStatus === "completed"
      ? "verified"
      : provider.verificationStatus === "failed"
        ? "failed"
        : "pending";
  record.verificationRegisteredName = provider.registeredName;
  record.verificationNameMatchScore = provider.nameMatchScore;
  record.verificationFailureReason = provider.failureReason;
  if (record.verificationStatus === "verified") record.verifiedAt = new Date();
  await record.save();

  return publicDestination(record);
};
