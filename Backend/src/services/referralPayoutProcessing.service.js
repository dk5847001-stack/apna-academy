import ReferralPayout from "../models/ReferralPayout.js";
import ReferralWallet from "../models/ReferralWallet.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralLedger from "../models/ReferralLedger.js";
import ReferralAuditEvent from "../models/ReferralAuditEvent.js";
import User from "../models/User.js";
import {
  createPayout,
  fetchPayout,
  fetchPayoutByReference,
  sanitizeProviderError,
} from "./razorpayX.service.js";
import { isRazorpayXEnabled } from "../config/razorpayX.js";
import { evaluateReferralWithdrawalRisk, recordReferralRiskEvent } from "./referralRisk.service.js";

const fail = (message, statusCode = 400, code = "REFERRAL_PAYOUT_ERROR") =>
  Object.assign(new Error(message), { statusCode, code });

const snapshot = (wallet) => ({
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
        correlationId:
          "referral_payout_" + action + "_" + payout.toString(),
      },
    ],
    { session }
  );
};

const getPayoutTransactionReference = (payout) =>
  payout?.payoutTransactionId || payout?._id?.toString();

const validatePayoutForProvider = (payout) => {
  if (!payout) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");
  if (payout.currency !== "INR") {
    throw fail("Only INR referral payouts are supported.", 400, "INVALID_CURRENCY");
  }
  if (!Number.isSafeInteger(payout.amountPaise) || payout.amountPaise < 100) {
    throw fail("Invalid referral payout amount.", 400, "INVALID_PAYOUT_AMOUNT");
  }
  if (!payout.providerFundAccountId) {
    throw fail(
      "Payout destination is not configured for provider processing.",
      409,
      "PAYOUT_DESTINATION_NOT_READY"
    );
  }
};

export const listAdminReferralPayouts = async ({ status, limit = 100 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
  const query = status ? { status } : {};
  return ReferralPayout.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate("user", "name email")
    .select(
      "+providerPayoutId +providerFundAccountId _id user amountPaise currency status payoutMethod destinationSnapshot requestedAt approvedAt processingAt processedAt failedAt reconciledAt failureReason failureCode rejectionReason reversedAt reversalReason providerStatus providerReferenceId providerUtr providerFailureReason providerFailureCode adminActor createdAt"
    )
    .lean();
};

export const approveReferralPayout = async ({ payoutId, adminId }) => {
  const candidate = await ReferralPayout.findById(payoutId).lean();
  if (!candidate) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");

  const risk = await evaluateReferralWithdrawalRisk({
    userId: candidate.user,
    destination: candidate.destinationSnapshot,
    amountPaise: candidate.amountPaise,
  });

  if (!risk.allowed) {
    await recordReferralRiskEvent({
      userId: candidate.user,
      payoutId: candidate._id,
      type: "manual_review",
      riskScore: risk.riskScore,
      signals: risk.signals,
      correlationId: risk.correlationId,
      status: "open",
    });
    throw fail(
      "Payout remains blocked by the referral risk controls.",
      403,
      "PAYOUT_RISK_BLOCKED"
    );
  }

  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId).session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");
      if (!["requested", "under_review"].includes(locked.status)) {
        throw fail(
          "Only requested or under-review payouts can be approved.",
          409,
          "INVALID_PAYOUT_STATE"
        );
      }

      const wallet = await ReferralWallet.findOne({ user: locked.user }).session(session);
      if (!wallet || wallet.lockedBalancePaise < locked.amountPaise) {
        throw fail(
          "Wallet lock does not cover this payout.",
          409,
          "WALLET_LOCK_MISMATCH"
        );
      }

      locked.status = "approved";
      locked.approvedAt = new Date();
      locked.adminActor = adminId;
      await locked.save({ session });

      await audit({
        payout: locked._id,
        user: locked.user,
        actor: adminId,
        action: "withdrawal_approved",
        metadata: { amountPaise: locked.amountPaise },
        session,
      });

      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

export const rejectReferralPayout = async ({
  payoutId,
  adminId,
  reason = "Payout rejected during admin review.",
}) => {
  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId).session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");
      if (!["requested", "under_review", "approved"].includes(locked.status)) {
        throw fail(
          "This payout cannot be rejected in its current state.",
          409,
          "INVALID_PAYOUT_STATE"
        );
      }

      const wallet = await ReferralWallet.findOne({ user: locked.user }).session(session);
      if (!wallet || wallet.lockedBalancePaise < locked.amountPaise) {
        throw fail("Wallet lock does not cover this payout.", 409, "WALLET_LOCK_MISMATCH");
      }

      const updatedWallet = await ReferralWallet.findOneAndUpdate(
        {
          _id: wallet._id,
          lockedBalancePaise: { $gte: locked.amountPaise },
        },
        {
          $inc: {
            lockedBalancePaise: -locked.amountPaise,
            availableBalancePaise: locked.amountPaise,
            version: 1,
          },
          $set: { lastTransactionAt: new Date() },
        },
        { new: true, session }
      );

      if (!updatedWallet) {
        throw fail("Wallet changed during payout rejection.", 409, "WALLET_CONFLICT");
      }

      await ReferralReward.updateMany(
        { referrer: locked.user, status: "withdrawal_locked" },
        { $set: { status: "available" } },
        { session }
      );

      await ReferralLedger.create(
        [
          {
            wallet: updatedWallet._id,
            user: locked.user,
            payout: locked._id,
            type: "withdrawal_unlock",
            direction: "credit",
            amountPaise: locked.amountPaise,
            currency: "INR",
            balanceAfter: snapshot(updatedWallet),
            idempotencyKey: "withdrawal_unlock:" + locked._id.toString(),
            description: "Referral withdrawal lock released after rejection.",
          },
        ],
        { session }
      );

      locked.status = "rejected";
      locked.rejectionReason = String(reason).trim().slice(0, 500);
      locked.failedAt = new Date();
      locked.adminActor = adminId;
      await locked.save({ session });

      await audit({
        payout: locked._id,
        user: locked.user,
        actor: adminId,
        action: "withdrawal_rejected",
        metadata: { reason: locked.rejectionReason },
        session,
      });

      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

const markProcessing = async ({ payoutId, adminId }) => {
  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId)
        .select("+providerFundAccountId +providerPayoutId")
        .session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");

      if (locked.status === "approved") {
        const wallet = await ReferralWallet.findOne({ user: locked.user }).session(session);
        if (!wallet || wallet.lockedBalancePaise < locked.amountPaise) {
          throw fail("Wallet lock does not cover this payout.", 409, "WALLET_LOCK_MISMATCH");
        }

        locked.status = "processing";
        locked.processingAt = new Date();
        locked.adminActor = adminId;
        await locked.save({ session });

        await audit({
          payout: locked._id,
          user: locked.user,
          actor: adminId,
          action: "payout_processing_started",
          metadata: { amountPaise: locked.amountPaise },
          session,
        });
      } else if (locked.status !== "processing") {
        throw fail(
          "Only an approved payout can enter provider processing.",
          409,
          "PAYOUT_NOT_APPROVED"
        );
      }

      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

const updateProviderSnapshot = async (payoutId, provider) => {
  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId)
        .select("+providerPayoutId +providerFundAccountId")
        .session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");

      if (
        provider.amountPaise !== null &&
        provider.amountPaise !== locked.amountPaise
      ) {
        throw fail(
          "RazorpayX returned an amount mismatch. Reconciliation is required.",
          409,
          "PROVIDER_AMOUNT_MISMATCH"
        );
      }

      if (provider.currency && provider.currency !== "INR") {
        throw fail(
          "RazorpayX returned an unsupported currency.",
          409,
          "PROVIDER_CURRENCY_MISMATCH"
        );
      }

      locked.providerPayoutId =
        provider.providerPayoutId || locked.providerPayoutId;
      locked.providerFundAccountId =
        provider.providerFundAccountId || locked.providerFundAccountId;
      locked.providerStatus = provider.providerStatus || locked.providerStatus;
      locked.providerReferenceId =
        provider.providerReferenceId || locked.providerReferenceId;
      locked.providerUtr = provider.providerUtr || locked.providerUtr;
      locked.providerFailureReason =
        provider.providerFailureReason || locked.providerFailureReason;
      locked.providerFailureCode =
        provider.providerFailureCode || locked.providerFailureCode;
      locked.reconciledAt = new Date();

      await locked.save({ session });
      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

export const finalizeProcessedPayout = async ({
  payoutId,
  provider,
}) => {
  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId)
        .select("+providerPayoutId +providerFundAccountId")
        .session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");
      if (locked.status === "processed") return;
      if (!["processing", "approved"].includes(locked.status)) {
        throw fail("Processed provider status cannot be applied to this local payout.", 409, "INVALID_PAYOUT_STATE");
      }

      if (provider.amountPaise !== null && provider.amountPaise !== locked.amountPaise) {
        throw fail("Provider payout amount mismatch.", 409, "PROVIDER_AMOUNT_MISMATCH");
      }

      const wallet = await ReferralWallet.findOne({ user: locked.user }).session(session);
      if (!wallet || wallet.lockedBalancePaise < locked.amountPaise) {
        throw fail("Wallet lock does not cover processed payout.", 409, "WALLET_LOCK_MISMATCH");
      }

      const updatedWallet = await ReferralWallet.findOneAndUpdate(
        { _id: wallet._id, lockedBalancePaise: { $gte: locked.amountPaise } },
        {
          $inc: {
            lockedBalancePaise: -locked.amountPaise,
            paidOutPaise: locked.amountPaise,
            version: 1,
          },
          $set: { lastTransactionAt: new Date() },
        },
        { new: true, session }
      );

      if (!updatedWallet) throw fail("Wallet changed during payout processing.", 409, "WALLET_CONFLICT");

      await ReferralReward.updateMany(
        { referrer: locked.user, status: "withdrawal_locked" },
        { $set: { status: "paid", paidAt: new Date() } },
        { session }
      );

      locked.status = "processed";
      locked.processedAt = new Date();
      locked.reconciledAt = new Date();
      locked.providerPayoutId = provider.providerPayoutId || locked.providerPayoutId;
      locked.providerFundAccountId = provider.providerFundAccountId || locked.providerFundAccountId;
      locked.providerStatus = provider.providerStatus || "processed";
      locked.providerReferenceId = provider.providerReferenceId || locked.providerReferenceId;
      locked.providerUtr = provider.providerUtr || locked.providerUtr;
      locked.providerFailureReason = provider.providerFailureReason || locked.providerFailureReason;
      locked.providerFailureCode = provider.providerFailureCode || locked.providerFailureCode;
      await locked.save({ session });

      await ReferralLedger.create(
        [
          {
            wallet: updatedWallet._id,
            user: locked.user,
            payout: locked._id,
            type: "payout",
            direction: "debit",
            amountPaise: locked.amountPaise,
            currency: "INR",
            balanceAfter: snapshot(updatedWallet),
            idempotencyKey: "payout:" + locked._id.toString(),
            description: "Referral payout processed by RazorpayX.",
            metadata: { providerPayoutId: provider.providerPayoutId || null },
          },
        ],
        { session }
      );

      await audit({
        payout: locked._id,
        user: locked.user,
        action: "payout_processed",
        metadata: {
          providerPayoutId: provider.providerPayoutId || null,
          providerStatus: provider.providerStatus || "processed",
          utr: provider.providerUtr || null,
        },
        session,
      });

      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

export const failReferralPayout = async ({
  payoutId,
  provider,
  reason,
  code,
}) => {
  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId)
        .select("+providerPayoutId +providerFundAccountId")
        .session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");
      if (["failed", "rejected", "cancelled"].includes(locked.status)) return;
      if (locked.status === "processed") {
        throw fail("A processed payout cannot be marked failed.", 409, "INVALID_PAYOUT_STATE");
      }

      const wallet = await ReferralWallet.findOne({ user: locked.user }).session(session);
      if (!wallet || wallet.lockedBalancePaise < locked.amountPaise) {
        throw fail("Wallet lock does not cover payout failure.", 409, "WALLET_LOCK_MISMATCH");
      }

      const updatedWallet = await ReferralWallet.findOneAndUpdate(
        { _id: wallet._id, lockedBalancePaise: { $gte: locked.amountPaise } },
        {
          $inc: {
            lockedBalancePaise: -locked.amountPaise,
            availableBalancePaise: locked.amountPaise,
            version: 1,
          },
          $set: { lastTransactionAt: new Date() },
        },
        { new: true, session }
      );

      if (!updatedWallet) throw fail("Wallet changed during payout failure.", 409, "WALLET_CONFLICT");

      await ReferralReward.updateMany(
        { referrer: locked.user, status: "withdrawal_locked" },
        { $set: { status: "available" } },
        { session }
      );

      await ReferralLedger.create(
        [
          {
            wallet: updatedWallet._id,
            user: locked.user,
            payout: locked._id,
            type: "withdrawal_unlock",
            direction: "credit",
            amountPaise: locked.amountPaise,
            currency: "INR",
            balanceAfter: snapshot(updatedWallet),
            idempotencyKey: "withdrawal_unlock:" + locked._id.toString(),
            description: "Referral payout failed before funds were sent.",
            metadata: { providerPayoutId: provider?.providerPayoutId || null },
          },
        ],
        { session }
      );

      locked.status = "failed";
      locked.failedAt = new Date();
      locked.failureReason = String(reason || "RazorpayX payout failed.").slice(0, 500);
      locked.failureCode = String(code || provider?.providerFailureCode || "PROVIDER_FAILURE").slice(0, 120);
      locked.providerPayoutId = provider?.providerPayoutId || locked.providerPayoutId;
      locked.providerFundAccountId = provider?.providerFundAccountId || locked.providerFundAccountId;
      locked.providerStatus = provider?.providerStatus || locked.providerStatus;
      locked.providerReferenceId = provider?.providerReferenceId || locked.providerReferenceId;
      locked.providerUtr = provider?.providerUtr || locked.providerUtr;
      locked.providerFailureReason = provider?.providerFailureReason || locked.providerFailureReason;
      locked.providerFailureCode = provider?.providerFailureCode || locked.providerFailureCode;
      locked.reconciledAt = new Date();
      await locked.save({ session });

      await audit({
        payout: locked._id,
        user: locked.user,
        action: "payout_failed",
        metadata: {
          providerPayoutId: provider?.providerPayoutId || null,
          reason: locked.failureReason,
          code: locked.failureCode,
        },
        session,
      });

      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

export const reverseProcessedPayout = async ({
  payoutId,
  provider,
  reason,
}) => {
  const session = await ReferralPayout.startSession();

  try {
    let payout;

    await session.withTransaction(async () => {
      const locked = await ReferralPayout.findById(payoutId)
        .select("+providerPayoutId +providerFundAccountId")
        .session(session);

      if (!locked) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");
      if (locked.status === "reversed") return;
      if (locked.status !== "processed") {
        throw fail("Only a processed payout can be reversed.", 409, "INVALID_PAYOUT_STATE");
      }

      const wallet = await ReferralWallet.findOne({ user: locked.user }).session(session);
      if (!wallet || wallet.paidOutPaise < locked.amountPaise) {
        throw fail("Wallet paid-out balance does not cover reversal.", 409, "WALLET_REVERSAL_MISMATCH");
      }

      const updatedWallet = await ReferralWallet.findOneAndUpdate(
        { _id: wallet._id, paidOutPaise: { $gte: locked.amountPaise } },
        {
          $inc: {
            paidOutPaise: -locked.amountPaise,
            reversedPaise: locked.amountPaise,
            version: 1,
          },
          $set: { lastTransactionAt: new Date() },
        },
        { new: true, session }
      );

      if (!updatedWallet) throw fail("Wallet changed during payout reversal.", 409, "WALLET_CONFLICT");

      await ReferralReward.updateMany(
        { referrer: locked.user, status: "paid" },
        { $set: { status: "reversed", reversedAt: new Date(), reversalReason: reason || "RazorpayX payout reversed." } },
        { session }
      );

      locked.status = "reversed";
      locked.reversedAt = new Date();
      locked.reversalReason = String(reason || "RazorpayX payout reversed.").slice(0, 500);
      locked.providerStatus = provider?.providerStatus || "reversed";
      locked.providerUtr = provider?.providerUtr || locked.providerUtr;
      locked.providerFailureReason = provider?.providerFailureReason || locked.providerFailureReason;
      locked.providerFailureCode = provider?.providerFailureCode || locked.providerFailureCode;
      locked.reconciledAt = new Date();
      await locked.save({ session });

      await ReferralLedger.create(
        [
          {
            wallet: updatedWallet._id,
            user: locked.user,
            payout: locked._id,
            type: "payout_reversal",
            direction: "credit",
            amountPaise: locked.amountPaise,
            currency: "INR",
            balanceAfter: snapshot(updatedWallet),
            idempotencyKey: "payout_reversal:" + locked._id.toString(),
            description: "Processed referral payout was reversed by RazorpayX.",
            metadata: { providerPayoutId: provider?.providerPayoutId || null },
          },
        ],
        { session }
      );

      await audit({
        payout: locked._id,
        user: locked.user,
        action: "payout_reversed",
        metadata: {
          providerPayoutId: provider?.providerPayoutId || null,
          reason: locked.reversalReason,
        },
        session,
      });

      payout = locked;
    });

    return payout;
  } finally {
    await session.endSession();
  }
};

const applyProviderStatus = async (payoutId, provider) => {
  if (provider.providerStatus === "processed") {
    return finalizeProcessedPayout({ payoutId, provider });
  }

  if (provider.providerStatus === "reversed") {
    return reverseProcessedPayout({
      payoutId,
      provider,
      reason: provider.providerFailureReason || "RazorpayX reported a reversal.",
    });
  }

  if (provider.providerStatus === "failed" || provider.providerStatus === "rejected" || provider.providerStatus === "cancelled") {
    return failReferralPayout({
      payoutId,
      provider,
      reason: provider.providerFailureReason || "RazorpayX reported a payout failure.",
      code: provider.providerFailureCode || provider.providerStatus,
    });
  }

  return updateProviderSnapshot(payoutId, provider);
};

export const processReferralPayout = async ({ payoutId, adminId }) => {
  if (!isRazorpayXEnabled) {
    throw fail(
      "RazorpayX payouts are not enabled on the server.",
      503,
      "RAZORPAYX_DISABLED"
    );
  }

  const preflight = await ReferralPayout.findById(payoutId)
    .select("+providerFundAccountId +providerPayoutId");

  validatePayoutForProvider(preflight);

  const risk = await evaluateReferralWithdrawalRisk({
    userId: preflight.user,
    destination: preflight.destinationSnapshot,
    amountPaise: preflight.amountPaise,
  });

  if (!risk.allowed) {
    await recordReferralRiskEvent({
      userId: preflight.user,
      payoutId: preflight._id,
      type: "payout_rejected",
      riskScore: risk.riskScore,
      signals: risk.signals,
      correlationId: risk.correlationId,
      status: "open",
    });
    throw fail(
      "Payout remains blocked by the referral risk controls.",
      403,
      "PAYOUT_RISK_BLOCKED"
    );
  }

  const payout = await markProcessing({ payoutId, adminId });

  validatePayoutForProvider(payout);

  let provider;

  if (payout.providerPayoutId) {
    try {
      provider = await fetchPayout(payout.providerPayoutId);
    } catch (error) {
      if (!error?.retryable) throw error;
    }
  }

  if (!provider) {
    try {
      provider = await createPayout({
        amountPaise: payout.amountPaise,
        currency: payout.currency,
        providerFundAccountId: payout.providerFundAccountId,
        payoutMethod: payout.payoutMethod,
        referenceId: getPayoutTransactionReference(payout),
        idempotencyKey: payout.idempotencyKey,
      });
    } catch (error) {
      if (error?.retryable) {
        await updateProviderSnapshot(payout._id, {
          providerStatus: "processing",
          providerFailureReason: "Provider outcome is unknown after a timeout/network failure.",
          providerFailureCode: error.code,
        });
        return ReferralPayout.findById(payout._id).lean();
      }

      const safe = sanitizeProviderError(error);
      return failReferralPayout({
        payoutId: payout._id,
        reason: safe.providerReason || "RazorpayX rejected the payout.",
        code: safe.providerReason || safe.code,
      });
    }
  }

  return applyProviderStatus(payout._id, provider);
};

export const reconcileReferralPayout = async ({ payoutId, adminId }) => {
  const payout = await ReferralPayout.findById(payoutId)
    .select("+providerPayoutId +providerFundAccountId")
    .lean();

  if (!payout) throw fail("Referral payout not found.", 404, "PAYOUT_NOT_FOUND");

  let providerList = [];

  if (payout.providerPayoutId) {
    providerList = [await fetchPayout(payout.providerPayoutId)];
  } else {
    providerList = await fetchPayoutByReference(getPayoutTransactionReference(payout));
  }

  if (!providerList.length) {
    const error = fail(
      "RazorpayX has not returned a payout record yet. The payout remains recoverable.",
      409,
      "PAYOUT_OUTCOME_UNKNOWN"
    );
    error.retryable = true;
    throw error;
  }

  const provider = providerList.find(
    (item) =>
      item.amountPaise === payout.amountPaise &&
      item.currency === "INR"
  );

  if (!provider) {
    throw fail(
      "No matching RazorpayX payout was found for the locked amount.",
      409,
      "PAYOUT_RECONCILIATION_MISMATCH"
    );
  }

  const result = await applyProviderStatus(payoutId, provider);

  await ReferralPayout.updateOne(
    { _id: payoutId },
    { $set: { adminActor: adminId, reconciledAt: new Date() } }
  );

  try {
    await ReferralAuditEvent.create({
      payout: payoutId,
      user: payout.user,
      actor: adminId,
      action: "payout_reconciled",
      metadata: {
        providerPayoutId: provider.providerPayoutId || null,
        providerStatus: provider.providerStatus || null,
      },
      correlationId: "referral_payout_payout_reconciled_" + payoutId.toString(),
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }

  return result;
};
