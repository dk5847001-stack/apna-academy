import crypto from "crypto";

import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import PromoRedemption from "../models/PromoRedemption.js";
import { validatePromoCode } from "../services/promoCode.service.js";
import {
  consumePromoReservation,
  releasePromoReservation,
  reservePromoForOrder,
} from "../services/promoReservation.service.js";

import razorpay from "../config/razorpay.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Create Razorpay order for:
 * 1. Course purchase
 * 2. All Modules Unlock
 *
 * IMPORTANT:
 * Amount is always taken from MongoDB.
 * Frontend cannot decide the payment amount.
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { courseId, purchaseType = "course", promoCode: promoCodeInput } = req.body;

  if (!courseId) {
    return res.status(400).json({ success: false, message: "Course ID is required." });
  }

  if (!["course", "all-access"].includes(purchaseType)) {
    return res.status(400).json({ success: false, message: "Invalid purchase type." });
  }

  const course = await Course.findById(courseId);

  if (!course || !course.isPublished) {
    return res.status(404).json({ success: false, message: "Course not found." });
  }

  const baseAmount =
    purchaseType === "all-access" ? course.allAccessPrice : course.price;

  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    return res.status(400).json({
      success: false,
      message:
        purchaseType === "all-access"
          ? "All-access price is not configured for this course."
          : "Course price is not configured.",
    });
  }

  let amount = Number(baseAmount);
  let appliedPromo = null;

  /*
   * Promo codes are intentionally supported only for normal course purchases.
   * The all-access ₹99 unlock remains a separate entitlement/payment flow.
   */
  if (purchaseType === "course" && String(promoCodeInput || "").trim()) {
    const promoResult = await validatePromoCode({
      userId: req.user.userId,
      code: promoCodeInput,
      courseId: course._id,
      amount: baseAmount,
    });

    if (!promoResult.valid) {
      return res.status(400).json({
        success: false,
        message: promoResult.message,
        code: promoResult.code,
      });
    }

    amount = Number(promoResult.pricing.finalAmount);
    appliedPromo = promoResult;
  }

  const amountInPaise = Math.round(amount * 100);

  const existingPurchase = await Purchase.findOne({
    user: req.user.userId,
    course: course._id,
    paymentStatus: "paid",
  });

  if (existingPurchase) {
    if (purchaseType === "all-access" && existingPurchase.unlockMode === "all_access") {
      return res.status(409).json({ success: false, message: "You already have all-access for this course." });
    }

    if (purchaseType === "course") {
      return res.status(409).json({ success: false, message: "You have already purchased this course." });
    }
  }

  const receipt = `course_${course._id.toString().slice(-10)}_${Date.now()}`;

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: {
      userId: req.user.userId.toString(),
      courseId: course._id.toString(),
      purchaseType,
      ...(appliedPromo?.promo?.code ? { promoCode: appliedPromo.promo.code } : {}),
    },
  });

  let promoReservation = null;

  if (appliedPromo?.promo?.id) {
    promoReservation = await reservePromoForOrder({
      promoCodeId: appliedPromo.promo.id,
      userId: req.user.userId,
      courseId: course._id,
      razorpayOrderId: order.id,
      pricing: appliedPromo.pricing,
    });

    if (!promoReservation) {
      return res.status(409).json({
        success: false,
        code: "PROMO_CHECKOUT_LIMIT_REACHED",
        message:
          "This promo code is currently unavailable because its usage limit has been reached. Please try again or remove the promo code.",
      });
    }
  }

  let purchase;

  try {
    purchase = await Purchase.create({
    user: req.user.userId,
    course: course._id,
    razorpayOrderId: order.id,
    amount,
    currency: "INR",
    purchaseType,
    unlockMode: purchaseType === "all-access" ? "all_access" : "daily",
    paymentStatus: "pending",
    ...(appliedPromo?.promo?.id
      ? {
          promoCode: appliedPromo.promo.id,
          promoCodeSnapshot: appliedPromo.promo.code,
          promoDiscountType: appliedPromo.promo.discountType,
          promoDiscountValue: appliedPromo.promo.discountValue,
          promoDiscountAmount: Number(appliedPromo.pricing.discountAmount),
          originalAmount: Number(appliedPromo.pricing.originalAmount),
          promoReservation: promoReservation._id,
        }
      : {}),
    });

    if (promoReservation) {
      await promoReservation.updateOne({ $set: { purchase: purchase._id } });
    }
  } catch (error) {
    if (promoReservation) {
      await releasePromoReservation({
        razorpayOrderId: order.id,
        userId: req.user.userId,
      });
    }
    throw error;
  }

  return successResponse({
    res,
    statusCode: 201,
    message: "Payment order created successfully.",
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseId: course._id,
      purchaseType,
    },
  });
});

/**
 * Verify Razorpay payment.
 *
 * Security checks performed server-side:
 * 1. Authenticated user owns the local order.
 * 2. Razorpay signature is valid.
 * 3. Razorpay payment belongs to the submitted order.
 * 4. Razorpay payment is captured.
 * 5. Razorpay order is paid.
 * 6. Razorpay amount/currency match the local purchase.
 *
 * The secret key NEVER goes to the frontend.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Incomplete Razorpay payment details." });
  }

  const purchase = await Purchase.findOne({
    user: req.user.userId,
    razorpayOrderId: razorpay_order_id,
  });

  if (!purchase) {
    return res.status(404).json({ success: false, message: "Payment order not found." });
  }

  if (purchase.paymentStatus === "paid") {
    return successResponse({
      res,
      message: "Payment is already verified.",
      data: { purchaseId: purchase._id, paymentStatus: purchase.paymentStatus },
    });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const suppliedSignature = razorpay_signature.trim().toLowerCase();
  const expectedSignature = generatedSignature.toLowerCase();
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const suppliedBuffer = Buffer.from(suppliedSignature, "hex");

  const isValidSignature =
    suppliedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);

  if (!isValidSignature) {
    return res.status(400).json({ success: false, message: "Invalid payment signature." });
  }

  const [razorpayOrder, razorpayPayment] = await Promise.all([
    razorpay.orders.fetch(razorpay_order_id),
    razorpay.payments.fetch(razorpay_payment_id),
  ]);

  const expectedAmountInPaise = Math.round(purchase.amount * 100);

  const paymentMatchesOrder = razorpayPayment.order_id === razorpay_order_id;
  const amountMatches =
    Number(razorpayOrder.amount) === expectedAmountInPaise &&
    Number(razorpayPayment.amount) === expectedAmountInPaise;
  const currencyMatches =
    razorpayOrder.currency === purchase.currency &&
    razorpayPayment.currency === purchase.currency;
  const paymentCaptured = razorpayPayment.status === "captured";
  const orderPaid = razorpayOrder.status === "paid";

  if (!paymentMatchesOrder || !amountMatches || !currencyMatches || !paymentCaptured || !orderPaid) {
    return res.status(400).json({ success: false, message: "Payment could not be verified." });
  }

  /*
   * Convert the promo reservation + purchase to paid in one MongoDB
   * transaction. If either update fails, neither the usage counter nor the
   * purchase status is committed.
   */
  const session = await Purchase.startSession();

  try {
    await session.withTransaction(async () => {
      const lockedPurchase = await Purchase.findOne({
        _id: purchase._id,
        user: req.user.userId,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "pending",
      }).session(session);

      if (!lockedPurchase) {
        throw Object.assign(new Error("Payment order is no longer pending."), {
          statusCode: 409,
        });
      }

      if (lockedPurchase.promoReservation) {
        const consumed = await consumePromoReservation({
          razorpayOrderId: razorpay_order_id,
          userId: req.user.userId,
          purchaseId: lockedPurchase._id,
          session,
        });

        if (!consumed) {
          throw Object.assign(
            new Error(
              "Promo reservation could not be finalized. Please contact support before retrying."
            ),
            { statusCode: 409 }
          );
        }

        const promoRedemption = await PromoRedemption.create(
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
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              redeemedAt: new Date(),
            },
          ],
          { session }
        );

        if (!promoRedemption[0]) {
          throw Object.assign(
            new Error("Promo redemption could not be recorded."),
            { statusCode: 500 }
          );
        }
      }

      lockedPurchase.razorpayPaymentId = razorpay_payment_id;
      lockedPurchase.paymentStatus = "paid";
      lockedPurchase.purchasedAt = new Date();

      await lockedPurchase.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return successResponse({
    res,
    message: "Payment verified successfully.",
    data: {
      purchaseId: purchase._id,
      courseId: purchase.course,
      purchaseType: purchase.purchaseType,
      unlockMode: purchase.unlockMode,
      paymentStatus: purchase.paymentStatus,
      purchasedAt: purchase.purchasedAt,
    },
  });
});