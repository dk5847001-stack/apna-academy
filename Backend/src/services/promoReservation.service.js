import mongoose from "mongoose";
import PromoCode from "../models/PromoCode.js";
import PromoReservation from "../models/PromoReservation.js";

const RESERVATION_TTL_MS = Math.max(
  5 * 60 * 1000,
  Number(process.env.PROMO_RESERVATION_TTL_MS || 15 * 60 * 1000)
);

const normalizeId = (value) => new mongoose.Types.ObjectId(value);

const releaseExpiredReservations = async (now = new Date()) => {
  const expired = await PromoReservation.find(
    { status: "reserved", expiresAt: { $lte: now } },
    { _id: 1, promoCode: 1 }
  ).lean();

  if (!expired.length) return 0;

  const ids = expired.map((item) => item._id);

  const result = await PromoReservation.updateMany(
    { _id: { $in: ids }, status: "reserved" },
    {
      $set: {
        status: "expired",
        releasedAt: now,
      },
    }
  );

  if (result.modifiedCount > 0) {
    const byPromo = new Map();

    expired.forEach((item) => {
      const key = item.promoCode.toString();
      byPromo.set(key, (byPromo.get(key) || 0) + 1);
    });

    for (const [promoCodeId, count] of byPromo) {
      await PromoCode.updateOne(
        { _id: promoCodeId, reservedCount: { $gte: count } },
        { $inc: { reservedCount: -count } }
      );
    }
  }

  return result.modifiedCount;
};

const reserveSlot = async ({
  promo,
  userId,
  courseId,
  razorpayOrderId,
  pricing,
}) => {
  const perUserLimit =
    promo.perUserLimit === null || promo.perUserLimit === undefined
      ? 1
      : Number(promo.perUserLimit);

  /*
   * Try each per-user slot. The unique partial index makes the insert
   * itself the atomic guard against two simultaneous requests taking
   * the same user slot.
   */
  for (let slot = 0; slot < perUserLimit; slot += 1) {
    const reservation = {
      promoCode: promo._id,
      user: normalizeId(userId),
      course: normalizeId(courseId),
      razorpayOrderId,
      slot,
      status: "reserved",
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + RESERVATION_TTL_MS),
      discountAmount: pricing.discountAmount,
      originalAmount: pricing.originalAmount,
      finalAmount: pricing.finalAmount,
    };

    try {
      const created = await PromoReservation.create(reservation);
      return created;
    } catch (error) {
      if (error?.code !== 11000) throw error;
    }
  }

  return null;
};

/*
 * Atomically reserve one total-usage slot.
 * usedCount + reservedCount can never exceed usageLimit.
 */
export const reservePromoForOrder = async ({
  promoCodeId,
  userId,
  courseId,
  razorpayOrderId,
  pricing,
}) => {
  await releaseExpiredReservations();

  const promo = await PromoCode.findOneAndUpdate(
    {
      _id: promoCodeId,
      isActive: true,
      ...(pricing?.originalAmount
        ? {}
        : {}),
      $or: [
        { usageLimit: null },
        { usageLimit: { $exists: false } },
        {
          $expr: {
            $lt: [
              { $add: ["$usedCount", "$reservedCount"] },
              "$usageLimit",
            ],
          },
        },
      ],
    },
    { $inc: { reservedCount: 1 } },
    { new: true }
  ).lean();

  if (!promo) return null;

  const reservation = await reserveSlot({
    promo,
    userId,
    courseId,
    razorpayOrderId,
    pricing,
  });

  if (!reservation) {
    await PromoCode.updateOne(
      { _id: promo._id, reservedCount: { $gt: 0 } },
      { $inc: { reservedCount: -1 } }
    );
    return null;
  }

  return reservation;
};

export const releasePromoReservation = async ({
  razorpayOrderId,
  userId,
}) => {
  const reservation = await PromoReservation.findOne({
    razorpayOrderId,
    user: userId,
    status: "reserved",
  });

  if (!reservation) return false;

  const updated = await PromoReservation.findOneAndUpdate(
    {
      _id: reservation._id,
      status: "reserved",
    },
    {
      $set: {
        status: "released",
        releasedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!updated) return false;

  await PromoCode.updateOne(
    { _id: updated.promoCode, reservedCount: { $gt: 0 } },
    { $inc: { reservedCount: -1 } }
  );

  return true;
};

/*
 * Convert the reservation into one successful redemption atomically.
 * This is called only after Razorpay payment verification succeeds.
 */
export const consumePromoReservation = async ({
  razorpayOrderId,
  userId,
  purchaseId,
}) => {
  const reservation = await PromoReservation.findOneAndUpdate(
    {
      razorpayOrderId,
      user: userId,
      status: "reserved",
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        status: "consumed",
        consumedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!reservation) return null;

  const promo = await PromoCode.findOneAndUpdate(
    {
      _id: reservation.promoCode,
      reservedCount: { $gt: 0 },
      $or: [
        { usageLimit: null },
        { usageLimit: { $exists: false } },
        {
          $expr: {
            $lt: ["$usedCount", "$usageLimit"],
          },
        },
      ],
    },
    {
      $inc: {
        reservedCount: -1,
        usedCount: 1,
      },
  },
    { new: true }
  );

  if (!promo) {
    /*
     * The reservation should not be consumed if the promo counter cannot
     * be converted. Restore the reservation state so the operation can be
     * retried safely.
     */
    await PromoReservation.updateOne(
      { _id: reservation._id, status: "consumed" },
      {
        $set: { status: "reserved", consumedAt: null },
      }
    );
    return null;
  }

  await PromoReservation.updateOne(
    { _id: reservation._id },
    { $set: { purchase: purchaseId } }
  );

  return {
    reservation,
    promo,
  };
};

export { releaseExpiredReservations, RESERVATION_TTL_MS };
