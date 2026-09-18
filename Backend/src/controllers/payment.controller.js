import crypto from "crypto";

import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import PromoCode from "../models/PromoCode.js";
import PromoRedemption from "../models/PromoRedemption.js";
import { validatePromoCode } from "../services/promoCode.service.js";

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
    },
  });

  await Purchase.create({
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
        }
      : {}),
  });

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

  purchase.razorpayPaymentId = razorpay_payment_id;
  purchase.paymentStatus = "paid";
  purchase.purchasedAt = new Date();

  await purchase.save();

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