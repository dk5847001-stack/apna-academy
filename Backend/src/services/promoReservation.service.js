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

  /*
   * Update each reservation with a status guard. Only reservations that this
   * process actually changes are counted toward reservedCount, preventing two
   * backend instances from decrementing the same promo slots twice.
   */
  for (const item of expired) {
    const released = await PromoReservation.findOneAndUpdate(
      { _id: item._id, status: "reserved" },
      {
        $set: {
          status: "expired",
          releasedAt: now,
        },
      },
      { new: true }
    ).lean();

    if (!released) continue;

    releasedCount += 1;
    const key = released.promoCode.toString();
    releasedByPromo.set(key, (releasedByPromo.get(key) || 0) + 1);
  }

  for (const [promoCodeId, count] of releasedByPromo) {
    await PromoCode.updateOne(
      { _id: promoCodeId, reservedCount: { $gte: count } },
      { $inc: { reservedCount: -count } }
    );
  }

  return releasedCount;
};

