import crypto from "crypto";

import User from "../models/User.js";
import Referral from "../models/Referral.js";

const REFERRAL_CODE_PREFIX = "APNA";
const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_CODE_RANDOM_LENGTH = 8;
const CODE_GENERATION_ATTEMPTS = 12;

const buildError = (message, statusCode = 400, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};

export const normalizeReferralCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const createRandomPart = () => {
  let value = "";
  for (let index = 0; index < REFERRAL_CODE_RANDOM_LENGTH; index += 1) {
    value += REFERRAL_CODE_ALPHABET[
      crypto.randomInt(0, REFERRAL_CODE_ALPHABET.length)
    ];
  }
  return value;
};

export const generateUniqueReferralCode = async () => {
  for (let attempt = 0; attempt < CODE_GENERATION_ATTEMPTS; attempt += 1) {
    const code = `${REFERRAL_CODE_PREFIX}-${createRandomPart()}`;
    const exists = await User.exists({ referralCode: code });
    if (!exists) return code;
  }

  throw buildError(
    "Unable to generate a unique referral code. Please try again.",
    503,
    "REFERRAL_CODE_GENERATION_FAILED"
  );
};

/*
 * Gives every account a stable referral identity. The update is conditional,
 * so concurrent requests cannot overwrite an already assigned code.
 */
export const ensureReferralCode = async (userId) => {
  if (!userId) {
    throw buildError("User is required.", 400);
  }

  const user = await User.findById(userId).select("+referralCode");
  if (!user) {
    throw buildError("User not found.", 404);
  }

  if (user.referralCode) {
    return user.referralCode;
  }

  for (let attempt = 0; attempt < CODE_GENERATION_ATTEMPTS; attempt += 1) {
    const code = await generateUniqueReferralCode();

    try {
      const updated = await User.findOneAndUpdate(
        { _id: userId, $or: [{ referralCode: null }, { referralCode: { $exists: false } }] },
        { $set: { referralCode: code } },
        { new: true, projection: { referralCode: 1 } }
      );

      if (updated?.referralCode) {
        return updated.referralCode;
      }

      const current = await User.findById(userId).select("+referralCode");
      if (current?.referralCode) {
        return current.referralCode;
      }
    } catch (error) {
      if (error?.code === 11000) continue;
      throw error;
    }
  }

  throw buildError(
    "Unable to assign a unique referral code. Please try again.",
    503,
    "REFERRAL_CODE_ASSIGNMENT_FAILED"
  );
};

export const validateReferralCodeForRegistration = async ({
  referralCode,
  referredUserId = null,
}) => {
  const normalizedCode = normalizeReferralCode(referralCode);

  if (!normalizedCode) {
    return null;
  }

  if (!/^APNA-[A-Z0-9]{8}$/.test(normalizedCode)) {
    throw buildError("Invalid referral code.", 400, "INVALID_REFERRAL_CODE");
  }

  const referrer = await User.findOne({
    referralCode: normalizedCode,
    status: "active",
    isEmailVerified: true,
  }).select("_id referralCode");

  if (!referrer) {
    throw buildError("Invalid or inactive referral code.", 400, "INVALID_REFERRAL_CODE");
  }

  if (
    referredUserId &&
    referrer._id.toString() === referredUserId.toString()
  ) {
    throw buildError(
      "You cannot use your own referral code.",
      400,
      "SELF_REFERRAL"
    );
  }

  return {
    referrerId: referrer._id,
    referralCode: normalizedCode,
  };
};

/*
 * Attribution is immutable and idempotent. A retry for the same account
 * returns the existing relationship rather than creating another one.
 */
export const createReferralAttribution = async ({
  referredUserId,
  referralCode,
}) => {
  if (!referredUserId) {
    throw buildError("Referred user is required.", 400);
  }

  const normalizedCode = normalizeReferralCode(referralCode);
  if (!normalizedCode) return null;

  const existing = await Referral.findOne({ referredUser: referredUserId });
  if (existing) {
    if (existing.referralCodeSnapshot !== normalizedCode) {
      throw buildError(
        "This account already has a referral attribution.",
        409,
        "REFERRAL_ALREADY_ATTRIBUTED"
      );
    }
    return existing;
  }

  const attribution = await validateReferralCodeForRegistration({
    referralCode: normalizedCode,
    referredUserId,
  });

  try {
    return await Referral.create({
      referrer: attribution.referrerId,
      referredUser: referredUserId,
      referralCodeSnapshot: attribution.referralCode,
      status: "registered",
      attributionSource: "registration_link",
      attributedAt: new Date(),
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;

    const concurrent = await Referral.findOne({ referredUser: referredUserId });
    if (!concurrent) throw error;

    if (concurrent.referralCodeSnapshot !== normalizedCode) {
      throw buildError(
        "This account already has a referral attribution.",
        409,
        "REFERRAL_ALREADY_ATTRIBUTED"
      );
    }

    return concurrent;
  }
};

export const getMyReferralDetails = async (userId) => {
  const user = await User.findById(userId).select("referralCode");
  if (!user) throw buildError("User not found.", 404);

  const referralCode = user.referralCode || (await ensureReferralCode(userId));
  const referral = await Referral.findOne({ referrer: userId })
    .sort({ createdAt: -1 })
    .select("referredUser referralCodeSnapshot status attributedAt qualifiedAt rewardedAt");

  return {
    referralCode,
    referral: referral || null,
  };
};
