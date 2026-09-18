import crypto from "crypto";
import Referral from "../models/Referral.js";
import ReferralPayout from "../models/ReferralPayout.js";
import ReferralRiskEvent from "../models/ReferralRiskEvent.js";
import User from "../models/User.js";

const RISK_REVIEW_SCORE = Number.isSafeInteger(Number(process.env.REFERRAL_RISK_REVIEW_SCORE))
  ? Number(process.env.REFERRAL_RISK_REVIEW_SCORE)
  : 40;
const RISK_BLOCK_SCORE = Number.isSafeInteger(Number(process.env.REFERRAL_RISK_BLOCK_SCORE))
  ? Number(process.env.REFERRAL_RISK_BLOCK_SCORE)
  : 70;

const buildCorrelationId = () => `referral_risk_${crypto.randomUUID()}`;

const addSignal = (signals, score, points, signal) => {
  signals.push(signal);
  return score + points;
};

export const evaluateReferralWithdrawalRisk = async ({
  userId,
  destination,
  amountPaise,
}) => {
  const signals = [];
  let riskScore = 0;
  const now = new Date();

  const [user, recentReferrals, recentPayouts] = await Promise.all([
    User.findById(userId).select("_id email status isEmailVerified"),
    Referral.countDocuments({
      referrer: userId,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    }),
    ReferralPayout.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  if (!user) {
    return { allowed: false, requiresReview: false, riskScore: 100, signals: ["user_not_found"] };
  }

  if (!user.isEmailVerified) {
    riskScore = addSignal(signals, riskScore, 40, "email_not_verified");
  }

  if (user.status !== "active") {
    riskScore = addSignal(signals, riskScore, 40, "account_not_active");
  }

  if (recentReferrals >= 10) {
    riskScore = addSignal(signals, riskScore, 35, "high_referral_velocity_24h");
  } else if (recentReferrals >= 5) {
    riskScore = addSignal(signals, riskScore, 20, "elevated_referral_velocity_24h");
  }

  if (recentPayouts >= 3) {
    riskScore = addSignal(signals, riskScore, 30, "high_withdrawal_velocity_7d");
  } else if (recentPayouts >= 2) {
    riskScore = addSignal(signals, riskScore, 15, "elevated_withdrawal_velocity_7d");
  }

  const method = String(destination?.method || "").toLowerCase();
  let destinationQuery = null;
  const destinationSecret = String(
    process.env.REFERRAL_PAYOUT_DESTINATION_HMAC_SECRET || process.env.JWT_SECRET || ""
  ).trim();

  if (destinationSecret && method === "upi" && destination.upiId) {
    const fingerprint = crypto
      .createHmac("sha256", destinationSecret)
      .update(
        "upi|" +
          String(destination.accountHolderName || "").toLowerCase() +
          "|" +
          destination.upiId
      )
      .digest("hex");
    destinationQuery = { "destinationSnapshot.destinationFingerprint": fingerprint };
  }

  if (method === "bank" && destination.ifsc && destination.accountNumberLast4 && destination.accountNumber) {
    const fingerprint = destinationSecret
      ? crypto
          .createHmac("sha256", destinationSecret)
          .update(
            "bank|" +
              String(destination.accountHolderName || "").toLowerCase() +
              "|" +
              destination.accountNumber +
              "|" +
              destination.ifsc
          )
          .digest("hex")
      : null;
    if (fingerprint) {
      destinationQuery = { "destinationSnapshot.destinationFingerprint": fingerprint };
    }
  }

  if (destinationQuery) {
    const duplicateDestinationUsers = await ReferralPayout.distinct("user", {
      ...destinationQuery,
      user: { $ne: userId },
      status: { $nin: ["rejected", "cancelled", "failed"] },
    });

    if (duplicateDestinationUsers.length > 0) {
      riskScore = addSignal(
        signals,
        riskScore,
        60,
        "payout_destination_used_by_another_account"
      );
    }
  }

  if (Number.isSafeInteger(amountPaise) && amountPaise > 0) {
    const availableRewardCount = await Referral.countDocuments({
      referrer: userId,
      status: "rewarded",
      rewardedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    });

    if (availableRewardCount >= 20) {
      riskScore = addSignal(signals, riskScore, 15, "high_reward_volume_30d");
    }
  }

  riskScore = Math.min(100, riskScore);

  return {
    allowed: riskScore < RISK_BLOCK_SCORE,
    requiresReview: riskScore >= RISK_REVIEW_SCORE && riskScore < RISK_BLOCK_SCORE,
    riskScore,
    signals,
    correlationId: buildCorrelationId(),
  };
};

export const recordReferralRiskEvent = async ({
  userId,
  payoutId = null,
  type = "manual_review",
  riskScore,
  signals,
  correlationId,
  status = "open",
}) => {
  return ReferralRiskEvent.create({
    user: userId,
    payout: payoutId,
    type,
    status,
    riskScore,
    signals: signals.slice(0, 20),
    correlationId: correlationId || buildCorrelationId(),
  });
};

export const getReferralRiskThresholds = () => ({
  reviewScore: RISK_REVIEW_SCORE,
  blockScore: RISK_BLOCK_SCORE,
});
