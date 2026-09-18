import crypto from "crypto";
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

  const releasedByPromo = new Map();
  let releasedCount = 0;

  for (const item of expired) {
    const session = await mongoose.startSession();
    try {
      let released = null;
      await session.withTransaction(async () => {
        released = await PromoReservation.findOneAndUpdate(
          { _id: item._id, status: "reserved", expiresAt: { $lte: now } },
          { $set: { status: "expired", releasedAt: now } },
          { new: true, session }
        ).lean();

        if (!released) return;

        const updatedPromo = await PromoCode.findOneAndUpdate(
          { _id: released.promoCode, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1 } },
          { new: true, session }
        );

        if (!updatedPromo) {
          throw new Error("Promo reservation counter could not be released.");
        }
      });
      if (released) releasedCount += 1;
    } finally {
      await session.endSession();
    }
  }

  return releasedCount;
};

export const reservePromoForOrder = async ({
  promoCodeId,
  userId,
  courseId,
  razorpayOrderId,
  pricing,
}) => {
  await releaseExpiredReservations();

  const session = await mongoose.startSession();
  try {
    let reservation = null;
    await session.withTransaction(async () => {
      const promo = await PromoCode.findOne({
        _id: promoCodeId,
        isActive: true,
        $or: [
          { usageLimit: null },
          { usageLimit: { $exists: false } },
          {
            $expr: {
              $lt: [
                { $add: [{ $ifNull: ["$usedCount", 0] }, { $ifNull: ["$reservedCount", 0] }] },
                "$usageLimit",
              ],
            },
          },
        ],
      }).session(session);

      if (!promo) return;

      const perUserLimit =
        promo.perUserLimit === null || promo.perUserLimit === undefined
          ? null
          : Number(promo.perUserLimit);

      const slots =
        perUserLimit === null
          ? [crypto.randomInt(0, 2_147_483_647)]
          : Array.from({ length: perUserLimit }, (_, index) => index);

      for (const slot of slots) {
        try {
          const created = await PromoReservation.create([{
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
          }], { session });
          reservation = created[0];
          break;
        } catch (error) {
          if (error?.code !== 11000) throw error;
        }
      }

      if (!reservation) return;

      const counterUpdate = await PromoCode.updateOne(
        {
          _id: promo._id,
          $or: [
            { usageLimit: null },
            { usageLimit: { $exists: false } },
            {
              $expr: {
                $lt: [
                  { $add: [{ $ifNull: ["$usedCount", 0] }, { $ifNull: ["$reservedCount", 0] }] },
                  "$usageLimit",
                ],
              },
            },
          ],
        },
        { $inc: { reservedCount: 1 } },
        { session }
      );
      if (counterUpdate.modifiedCount !== 1) {
        throw Object.assign(new Error("Promo reservation limit changed. Please retry checkout."), { statusCode: 409 });
      }

    });

    return reservation;
  } finally {
    await session.endSession();
  }
};
export const releasePromoReservation = async ({
  razorpayOrderId,
  userId,
  session = null,
}) => {
  const run = async (dbSession) => {
    const reservation = await PromoReservation.findOneAndUpdate(
      { razorpayOrderId, user: userId, status: "reserved" },
      { $set: { status: "released", releasedAt: new Date() } },
      { new: true, ...(dbSession ? { session: dbSession } : {}) }
    );

    if (!reservation) return false;

    const promo = await PromoCode.findOneAndUpdate(
      { _id: reservation.promoCode, reservedCount: { $gt: 0 } },
      { $inc: { reservedCount: -1 } },
      { new: true, ...(dbSession ? { session: dbSession } : {}) }
    );

    if (!promo) {
      throw new Error("Promo reservation counter could not be released.");
    }

    return true;
  };

  if (session) return run(session);

  const dbSession = await mongoose.startSession();
  try {
    let result = false;
    await dbSession.withTransaction(async () => {
      result = await run(dbSession);
    });
    return result;
  } finally {
    await dbSession.endSession();
  }
};

export const consumePromoReservation = async ({
  razorpayOrderId,
  userId,
  purchaseId,
  session = null,
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
        purchase: purchaseId,
      },
    },
    { new: true, ...(session ? { session } : {}) }
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
            $lt: [
              { $ifNull: ["$usedCount", 0] },
              "$usageLimit",
            ],
          },
        },
      ],
    },
    { $inc: { reservedCount: -1, usedCount: 1 } },
    { new: true, ...(session ? { session } : {}) }
  );

  if (!promo) return null;

  return { reservation, promo };
};

export { releaseExpiredReservations, RESERVATION_TTL_MS };
