import crypto from "crypto";
import Referral from "../models/Referral.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralWallet from "../models/ReferralWallet.js";
import ReferralAuditEvent from "../models/ReferralAuditEvent.js";
import Purchase from "../models/Purchase.js";

const DEFAULT_REWARD_PAISE = 19900;
const DEFAULT_MIN_PURCHASE_PAISE = 49900;

const parseSafePaise = (value, fallback) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export const REFERRAL_REWARD_PAISE = parseSafePaise(
  process.env.REFERRAL_REWARD_PAISE,
  DEFAULT_REWARD_PAISE
);

export const REFERRAL_MIN_PURCHASE_PAISE = parseSafePaise(
  process.env.REFERRAL_MIN_PURCHASE_PAISE,
  DEFAULT_MIN_PURCHASE_PAISE
);

const buildCorrelationId = (prefix) => `${prefix}_${crypto.randomUUID()}`;

const createAudit = async ({ referral, reward = null, user, action, metadata, session }) => {
  await ReferralAuditEvent.create(
    [{ referral, reward, user, action, metadata, correlationId: buildCorrelationId(action) }],
    { session }
  );
};

/**
 * Runs inside the same MongoDB transaction that changes a verified Purchase
 * from pending -> paid.
 *
 * Qualification rules:
 * - normal course purchase only (all-access is excluded)
 * - final paid amount >= configured minimum (default ₹499)
 * - referred account's first successful normal course purchase only
 * - immutable one-time referral qualification
 * - ₹199 reward is created as pending, not immediately withdrawable
 * - pending wallet balance is credited atomically
 * - no payout is performed in this phase
 */
export const qualifyReferralForPurchase = async ({ purchase, session }) => {
  if (!purchase?._id || !purchase?.user) return null;
  if (purchase.purchaseType !== "course" || purchase.paymentStatus !== "paid") return null;

  const amountPaise = Math.round(Number(purchase.amount) * 100);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < REFERRAL_MIN_PURCHASE_PAISE) {
    return null;
  }

  const referral = await Referral.findOne({
    referredUser: purchase.user,
    status: "registered",
  }).session(session);

  if (!referral) return null;

  // Lock the referral document so qualification attempts for the same account
  // are serialized by the transaction.
  const lockedReferral = await Referral.findOneAndUpdate(
    { _id: referral._id, status: "registered" },
    { $set: { updatedAt: new Date() } },
    { new: true, session }
  );

  if (!lockedReferral) return null;

  const previousPaidPurchase = await Purchase.findOne({
    user: purchase.user,
    purchaseType: "course",
    paymentStatus: "paid",
    _id: { $ne: purchase._id },
  })
    .select("_id razorpayPaymentId amount purchasedAt")
    .session(session)
    .lean();

  if (previousPaidPurchase) {
    await Referral.findOneAndUpdate(
      { _id: lockedReferral._id, status: "registered" },
      {
        $set: {
          status: "rejected",
          rejectionReason: "Referred account already had a successful course purchase before qualification.",
        },
      },
      { session }
    );

    await createAudit({
      referral: lockedReferral._id,
      user: lockedReferral.referredUser,
      action: "referral_rejected",
      metadata: {
        reason: "previous_paid_purchase",
        purchaseId: purchase._id.toString(),
        previousPurchaseId: previousPaidPurchase._id.toString(),
      },
      session,
    });

    return null;
  }

  const qualifiedAt = new Date();

  const qualifiedReferral = await Referral.findOneAndUpdate(
    { _id: lockedReferral._id, status: "registered" },
    {
      $set: {
        status: "qualified",
        qualifiedAt,
        qualificationPurchase: purchase._id,
        qualificationPurchaseAmountPaise: amountPaise,
      },
    },
    { new: true, session }
  );

  if (!qualifiedReferral) return null;

  let reward;
  try {
    const created = await ReferralReward.create(
      [{
        referral: qualifiedReferral._id,
        referrer: qualifiedReferral.referrer,
        referredUser: qualifiedReferral.referredUser,
        amountPaise: REFERRAL_REWARD_PAISE,
        currency: "INR",
        status: "pending",
        qualificationPurchase: purchase._id,
        qualifyingPurchaseAmountPaise: amountPaise,
      }],
      { session }
    );
    reward = created[0];
  } catch (error) {
    if (error?.code !== 11000) throw error;
    reward = await ReferralReward.findOne({ referral: qualifiedReferral._id }).session(session);
  }

  if (!reward) throw new Error("Referral reward could not be created.");

  await ReferralWallet.findOneAndUpdate(
    { user: qualifiedReferral.referrer },
    {
      $setOnInsert: { user: qualifiedReferral.referrer, currency: "INR" },
      $inc: {
        totalEarnedPaise: REFERRAL_REWARD_PAISE,
        pendingBalancePaise: REFERRAL_REWARD_PAISE,
        version: 1,
      },
      $set: { lastTransactionAt: qualifiedAt },
    },
    { upsert: true, new: true, session }
  );

  const rewardedReferral = await Referral.findOneAndUpdate(
    { _id: qualifiedReferral._id, status: "qualified" },
    { $set: { status: "rewarded", reward: reward._id, rewardedAt: qualifiedAt } },
    { new: true, session }
  );

  if (!rewardedReferral) throw new Error("Referral reward state could not be finalized.");

  await createAudit({
    referral: rewardedReferral._id,
    reward: reward._id,
    user: rewardedReferral.referrer,
    action: "referral_qualified",
    metadata: {
      qualificationPurchaseId: purchase._id.toString(),
      qualificationPurchaseAmountPaise: amountPaise,
      minimumPurchaseAmountPaise: REFERRAL_MIN_PURCHASE_PAISE,
    },
    session,
  });

  await createAudit({
    referral: rewardedReferral._id,
    reward: reward._id,
    user: rewardedReferral.referrer,
    action: "reward_created",
    metadata: {
      amountPaise: REFERRAL_REWARD_PAISE,
      status: "pending",
      qualificationPurchaseId: purchase._id.toString(),
    },
    session,
  });

  return { referral: rewardedReferral, reward };
};
