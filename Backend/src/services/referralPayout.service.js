import crypto from "crypto";
import ReferralWallet from "../models/ReferralWallet.js";
import ReferralPayout from "../models/ReferralPayout.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralLedger from "../models/ReferralLedger.js";
import ReferralAuditEvent from "../models/ReferralAuditEvent.js";
import ReferralPayoutDestination from "../models/ReferralPayoutDestination.js";
import User from "../models/User.js";
import { evaluateReferralWithdrawalRisk, recordReferralRiskEvent } from "./referralRisk.service.js";
import { ensureFundAccount } from "./razorpayX.service.js";
import { isRazorpayXEnabled } from "../config/razorpayX.js";

const MIN_WITHDRAWAL_PAISE = Number.isSafeInteger(Number(process.env.REFERRAL_MIN_WITHDRAWAL_PAISE)) ? Number(process.env.REFERRAL_MIN_WITHDRAWAL_PAISE) : 19900;
const MAX_WITHDRAWAL_PAISE = Number.isSafeInteger(Number(process.env.REFERRAL_MAX_WITHDRAWAL_PAISE)) ? Number(process.env.REFERRAL_MAX_WITHDRAWAL_PAISE) : 10000000;
const ACTIVE_STATUSES = ["requested", "under_review", "approved", "processing"];

const fail = (message, statusCode = 400, code = "REFERRAL_PAYOUT_ERROR") =>
  Object.assign(new Error(message), { statusCode, code });

const buildCorrelationId = (prefix = "referral_payout") =>
  prefix + "_" + crypto.randomUUID();

const normalizeDestination = ({
  method,
  upiId,
  accountHolderName,
  accountNumber,
  ifsc,
}) => {
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

  if (!/^[0-9]{9,18}$/.test(account)) {
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

const destinationFingerprint = (destination) => {
  const secret = String(
    process.env.REFERRAL_PAYOUT_DESTINATION_HMAC_SECRET || process.env.JWT_SECRET || ""
  ).trim();

  if (!secret) {
    throw fail(
      "Payout destination security configuration is missing.",
      503,
      "PAYOUT_DESTINATION_SECURITY_NOT_CONFIGURED"
    );
  }

  const canonical =
    destination.method === "upi"
      ? "upi|" + destination.accountHolderName.toLowerCase() + "|" + destination.upiId
      : "bank|" +
        destination.accountHolderName.toLowerCase() +
        "|" +
        destination.accountNumber +
        "|" +
        destination.ifsc;

  return crypto.createHmac("sha256", secret).update(canonical).digest("hex");
};

const snapshotOf = (destination) =>
  destination.method === "upi"
    ? {
        method: destination.method,
        accountHolderName: destination.accountHolderName,
        upiId: destination.upiId,
      }
    : {
        method: destination.method,
        accountHolderName: destination.accountHolderName,
        accountNumberLast4: destination.accountNumberLast4,
        ifsc: destination.ifsc,
      };

const balanceAfter = (wallet) => ({
  totalEarnedPaise: wallet.totalEarnedPaise,
  availableBalancePaise: wallet.availableBalancePaise,
  pendingBalancePaise: wallet.pendingBalancePaise,
  lockedBalancePaise: wallet.lockedBalancePaise,
  paidOutPaise: wallet.paidOutPaise,
  reversedPaise: wallet.reversedPaise,
});

const audit = async ({
  payout,
  user,
  actor = null,
  action,
  metadata = {},
  session,
}) => {
  await ReferralAuditEvent.create(
    [
      {
        payout,
        user,
        actor,
        action,
        metadata,
        correlationId: buildCorrelationId(action),
      },
    ],
    { session }
  );
};

export const requestReferralWithdrawal = async ({
  userId,
  idempotencyKey,
  ...input
}) => {
  const key = String(idempotencyKey || "").trim();

  if (!/^[A-Za-z0-9._:-]{16,200}$/.test(key)) {
    throw fail(
      "A valid Idempotency-Key header is required.",
      400,
      "IDEMPOTENCY_KEY_REQUIRED"
    );
  }

  const existing = await ReferralPayout.findOne({
    user: userId,
    idempotencyKey: key,
  });

  if (existing) return existing;

  const destination = normalizeDestination(input);

  const risk = await evaluateReferralWithdrawalRisk({
    userId,
    destination,
    amountPaise: null,
  });

  if (!risk.allowed) {
    await recordReferralRiskEvent({
      userId,
      type: "manual_review",
      riskScore: risk.riskScore,
      signals: risk.signals,
      correlationId: risk.correlationId,
      status: "open",
    });

    throw fail(
      "Withdrawal requires security review before it can be submitted.",
      403,
      "WITHDRAWAL_RISK_BLOCKED"
    );
  }

  const user = await User.findById(userId).select(
    "_id name email phone status isEmailVerified"
  );

  if (!user) throw fail("User not found.", 404, "USER_NOT_FOUND");

  const fingerprint = destinationFingerprint(destination);

  let destinationRecord = await ReferralPayoutDestination.findOne({
    user: userId,
  }).select("+providerContactId +providerFundAccountId +destinationFingerprint");

  const sameDestination =
    destinationRecord?.destinationFingerprint === fingerprint;

  const provider =
    sameDestination && destinationRecord?.providerFundAccountId
      ? {
          providerContactId: destinationRecord.providerContactId,
          providerFundAccountId: destinationRecord.providerFundAccountId,
          active: true,
        }
      : isRazorpayXEnabled
        ? await ensureFundAccount({
            user,
            destination,
            providerContactId: sameDestination
              ? destinationRecord.providerContactId
              : null,
            providerFundAccountId: null,
          })
        : {
            providerContactId: sameDestination
              ? destinationRecord?.providerContactId || null
              : null,
            providerFundAccountId: null,
            active: false,
          };

  if (!destinationRecord) {
    destinationRecord = new ReferralPayoutDestination({ user: userId });
  }

  destinationRecord.method = destination.method;
  destinationRecord.accountHolderName = destination.accountHolderName;
  destinationRecord.upiId =
    destination.method === "upi" ? destination.upiId : null;
  destinationRecord.accountNumberLast4 =
    destination.method === "bank" ? destination.accountNumberLast4 : null;
  destinationRecord.ifsc =
    destination.method === "bank" ? destination.ifsc : null;
  destinationRecord.destinationFingerprint = fingerprint;
  destinationRecord.providerContactId = provider.providerContactId;
  destinationRecord.providerFundAccountId = provider.providerFundAccountId;
  destinationRecord.verifiedAt = null;

  await destinationRecord.save();

  const session = await ReferralWallet.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const wallet = await ReferralWallet.findOne({
        user: userId,
      }).session(session);

      if (!wallet) {
        throw fail("Referral wallet not found.", 404, "WALLET_NOT_FOUND");
      }

      const active = await ReferralPayout.findOne({
        user: userId,
        status: { $in: ACTIVE_STATUSES },
      }).session(session);

      if (active) {
        throw fail(
          "An existing withdrawal is already in progress.",
          409,
          "WITHDRAWAL_ALREADY_PENDING"
        );
      }

      const amount = wallet.availableBalancePaise;

      if (amount < MIN_WITHDRAWAL_PAISE) {
        throw fail(
          "Available balance is below the minimum withdrawal amount.",
          400,
          "MIN_WITHDRAWAL_NOT_REACHED"
        );
      }

      if (amount > MAX_WITHDRAWAL_PAISE) {
        throw fail(
          "Available balance exceeds the configured withdrawal limit.",
          400,
          "WITHDRAWAL_LIMIT_EXCEEDED"
        );
      }

      const finalRisk = await evaluateReferralWithdrawalRisk({
        userId,
        destination,
        amountPaise: amount,
      });

      if (!finalRisk.allowed) {
        await recordReferralRiskEvent({
          userId,
          type: "manual_review",
          riskScore: finalRisk.riskScore,
          signals: finalRisk.signals,
          correlationId: finalRisk.correlationId,
          status: "open",
        });

        throw fail(
          "Withdrawal requires security review before it can be submitted.",
          403,
          "WITHDRAWAL_RISK_BLOCKED"
        );
      }

      const now = new Date();

      payout = new ReferralPayout({
        user: userId,
        amountPaise: amount,
        currency: "INR",
        status: finalRisk.requiresReview ? "under_review" : "requested",
        payoutMethod: destination.method,
        destinationSnapshot: snapshotOf(destination),
        providerFundAccountId: provider.providerFundAccountId,
        requestedAt: now,
        idempotencyKey: key,
        correlationId: buildCorrelationId(),
      });

      await payout.save({ session });

      const updated = await ReferralWallet.findOneAndUpdate(
        {
          _id: wallet._id,
          version: wallet.version,
          availableBalancePaise: { $gte: amount },
        },
        {
          $inc: {
            availableBalancePaise: -amount,
            lockedBalancePaise: amount,
            version: 1,
          },
          $set: { lastTransactionAt: now },
        },
        { new: true, session }
      );

      if (!updated) {
        throw fail(
          "Wallet changed during withdrawal. Please retry.",
          409,
          "WALLET_CONFLICT"
        );
      }

      await ReferralReward.updateMany(
        { referrer: userId, status: "available" },
        { $set: { status: "withdrawal_locked" } },
        { session }
      );

      await ReferralLedger.create(
        [
          {
            wallet: updated._id,
            user: userId,
            payout: payout._id,
            type: "withdrawal_lock",
            direction: "debit",
            amountPaise: amount,
            currency: "INR",
            balanceAfter: balanceAfter(updated),
            idempotencyKey: "withdrawal_lock:" + payout._id.toString(),
            description:
              "Available referral balance locked for withdrawal request.",
            metadata: { payoutId: payout._id.toString() },
          },
        ],
        { session }
      );

      await audit({
        payout: payout._id,
        user: userId,
        action: "withdrawal_requested",
        metadata: {
          amountPaise: amount,
          payoutMethod: destination.method,
          status: payout.status,
        },
        session,
      });
    });

    return payout;
  } catch (error) {
    if (error?.code === 11000) {
      const concurrent = await ReferralPayout.findOne({
        user: userId,
        idempotencyKey: key,
      });

      if (concurrent) return concurrent;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const listMyReferralPayouts = async (userId) =>
  ReferralPayout.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select(
      "_id amountPaise currency status payoutMethod destinationSnapshot requestedAt approvedAt processingAt processedAt failedAt reconciledAt failureReason failureCode rejectionReason reversedAt reversalReason providerStatus providerReferenceId providerUtr providerFailureReason providerFailureCode createdAt"
    )
    .lean();
