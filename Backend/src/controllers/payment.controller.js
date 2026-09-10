import crypto from "crypto";

import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";

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
  const { courseId, purchaseType = "course" } = req.body;

  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Course ID is required.",
    });
  }

  if (!["course", "all-access"].includes(purchaseType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid purchase type.",
    });
  }

  const course = await Course.findById(courseId);

  if (!course || !course.isPublished) {
    return res.status(404).json({
      success: false,
      message: "Course not found.",
    });
  }

  const amount =
    purchaseType === "all-access"
      ? course.allAccessPrice
      : course.price;

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message:
        purchaseType === "all-access"
          ? "All-access price is not configured for this course."
          : "Course price is not configured.",
    });
  }

  /*
   * Prevent duplicate active purchases.
   */
  const existingPurchase = await Purchase.findOne({
    user: req.user.userId,
    course: course._id,
    paymentStatus: "paid",
  });

  if (existingPurchase) {
    if (
      purchaseType === "all-access" &&
      existingPurchase.unlockMode === "all_access"
    ) {
      return res.status(409).json({
        success: false,
        message: "You already have all-access for this course.",
      });
    }

    if (purchaseType === "course") {
      return res.status(409).json({
        success: false,
        message: "You have already purchased this course.",
      });
    }
  }

  const amountInPaise = Math.round(amount * 100);

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

  /*
   * Create a pending purchase.
   *
   * We DO NOT mark it as paid here.
   * Payment is considered successful only
   * after server-side Razorpay signature verification.
   */
  await Purchase.create({
    user: req.user.userId,
    course: course._id,
    razorpayOrderId: order.id,
    amount,
    currency: "INR",
    purchaseType,
    unlockMode:
      purchaseType === "all-access"
        ? "all_access"
        : "daily",
    paymentStatus: "pending",
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
 * Razorpay signature:
 * HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 *
 * The secret key NEVER goes to the frontend.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({
      success: false,
      message: "Incomplete Razorpay payment details.",
    });
  }

  const purchase = await Purchase.findOne({
    user: req.user.userId,
    razorpayOrderId: razorpay_order_id,
  });

  if (!purchase) {
    return res.status(404).json({
      success: false,
      message: "Payment order not found.",
    });
  }

  if (purchase.paymentStatus === "paid") {
    return successResponse({
      res,
      message: "Payment is already verified.",
      data: {
        purchaseId: purchase._id,
        paymentStatus: purchase.paymentStatus,
      },
    });
  }

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      `${razorpay_order_id}|${razorpay_payment_id}`
    )
    .digest("hex");

  const isValidSignature =
    generatedSignature === razorpay_signature;

  if (!isValidSignature) {
    purchase.paymentStatus = "failed";
    await purchase.save();

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature.",
    });
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