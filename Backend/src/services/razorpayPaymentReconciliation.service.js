import PromoRedemption from "../models/PromoRedemption.js";
import Purchase from "../models/Purchase.js";
import { consumePromoReservation, releasePromoReservation } from "./promoReservation.service.js";
import { qualifyReferralForPurchase } from "./referralQualification.service.js";

export const reconcileCapturedPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
}) => {
  const purchase = await Purchase.findOne({
    razorpayOrderId,
  });

  if (!purchase) {
    return { status: "ignored", reason: "purchase_not_found" };
  }

  if (purchase.paymentStatus === "paid") {
    return { status: "already_paid", purchaseId: purchase._id };
  }

  const session = await Purchase.startSession();

  try {
    let result = null;

    await session.withTransaction(async () => {
      const lockedPurchase = await Purchase.findOne({
        _id: purchase._id,
        razorpayOrderId,
        paymentStatus: "pending",
      }).session(session);

      if (!lockedPurchase) {
        result = { status: "already_processed", purchaseId: purchase._id };
        return;
      }

      if (lockedPurchase.promoReservation) {
        const consumed = await consumePromoReservation({
          razorpayOrderId,
          userId: lockedPurchase.user,
          purchaseId: lockedPurchase._id,
          session,
        });

        if (!consumed) {
          throw new Error(
            "Promo reservation could not be finalized for the captured Razorpay payment."
          );
        }

        const createdRedemption = await PromoRedemption.create(
          [
            {
              promoCode: lockedPurchase.promoCode,
              user: lockedPurchase.user,
              course: lockedPurchase.course,
              purchase: lockedPurchase._id,
              codeSnapshot: lockedPurchase.promoCodeSnapshot,
              discountType: lockedPurchase.promoDiscountType,
              discountValue: lockedPurchase.promoDiscountValue,
              discountAmount: lockedPurchase.promoDiscountAmount,
              orderAmount:
                lockedPurchase.originalAmount ?? lockedPurchase.amount,
              finalAmount: lockedPurchase.amount,
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: razorpayPaymentId,
              redeemedAt: new Date(),
            },
          ],
          { session }
        );

        if (!createdRedemption[0]) {
          throw new Error("Promo redemption could not be recorded.");
        }
      }

      lockedPurchase.razorpayPaymentId = razorpayPaymentId;
      lockedPurchase.paymentStatus = "paid";
      lockedPurchase.purchasedAt = new Date();

      await lockedPurchase.save({ session });

      await qualifyReferralForPurchase({
        purchase: lockedPurchase,
        session,
      });

      result = {
        status: "paid",
        purchaseId: lockedPurchase._id,
        courseId: lockedPurchase.course,
        purchaseType: lockedPurchase.purchaseType,
      };
    });

    return result || { status: "processed" };
  } finally {
    await session.endSession();
  }
};

export const markPaymentFailed = async ({
  razorpayOrderId,
  razorpayPaymentId,
}) => {
  const purchase = await Purchase.findOne({
    razorpayOrderId,
    paymentStatus: "pending",
  });

  if (!purchase) {
    return { status: "ignored", reason: "purchase_not_pending" };
  }

  const session = await Purchase.startSession();

  try {
    let result = null;

    await session.withTransaction(async () => {
      const lockedPurchase = await Purchase.findOne({
        _id: purchase._id,
        razorpayOrderId,
        paymentStatus: "pending",
      }).session(session);

      if (!lockedPurchase) {
        result = { status: "already_processed", purchaseId: purchase._id };
        return;
      }

      lockedPurchase.paymentStatus = "failed";
      if (razorpayPaymentId) {
        lockedPurchase.razorpayPaymentId = razorpayPaymentId;
      }

      await lockedPurchase.save({ session });

      if (lockedPurchase.promoReservation) {
        await releasePromoReservation({
          razorpayOrderId,
          userId: lockedPurchase.user,
          session,
        });
      }

      result = {
        status: "failed",
        purchaseId: lockedPurchase._id,
      };
    });

    return result || { status: "processed" };
  } finally {
    await session.endSession();
  }
};
