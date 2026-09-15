import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import DsaEntitlement from "../models/DsaEntitlement.js";
import DsaPayment from "../models/DsaPayment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const PLAN = "DSA_PREMIUM_MONTHLY";
const CURRENCY = "INR";
const PRICE_INR = Number(process.env.DSA_PREMIUM_PRICE_INR || 299);
const DURATION_DAYS = Number(process.env.DSA_PREMIUM_DURATION_DAYS || 30);

const getActiveEntitlement = (userId) =>
  DsaEntitlement.findOne({
    userId,
    isActive: true,
    accessType: { $in: ["PREMIUM", "ADMIN"] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

export const getDsaSubscription = asyncHandler(async (req, res) => {
  const entitlement = await getActiveEntitlement(req.user.userId);
  const premium = Boolean(entitlement);

  return successResponse({
    res,
    data: {
      premium,
      accessType: entitlement?.accessType || "FREE",
      startsAt: entitlement?.startsAt || null,
      expiresAt: entitlement?.expiresAt || null,
      plan: premium && entitlement?.source === "DSA_SUBSCRIPTION" ? PLAN : null,
      price: PRICE_INR,
      currency: CURRENCY,
      durationDays: DURATION_DAYS,
    },
  });
});

export const createDsaPremiumOrder = asyncHandler(async (req, res) => {
  if (!Number.isFinite(PRICE_INR) || PRICE_INR <= 0 || !Number.isInteger(DURATION_DAYS) || DURATION_DAYS <= 0) {
    return res.status(500).json({ success: false, message: "DSA premium pricing is not configured correctly." });
  }

  const active = await getActiveEntitlement(req.user.userId);
  if (active) {
    return res.status(409).json({ success: false, message: "DSA Premium is already active." });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(PRICE_INR * 100),
    currency: CURRENCY,
    receipt: `dsa_${req.user.userId.toString().slice(-10)}_${Date.now()}`,
    notes: {
      userId: req.user.userId.toString(),
      product: "DSA_PREMIUM",
      plan: PLAN,
    },
  });

  await DsaPayment.create({
    userId: req.user.userId,
    razorpayOrderId: order.id,
    amount: PRICE_INR,
    currency: CURRENCY,
    plan: PLAN,
    status: "pending",
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "DSA Premium payment order created.",
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: PLAN,
      durationDays: DURATION_DAYS,
    },
  });
});

export const verifyDsaPremiumPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Incomplete Razorpay payment details." });
  }

  const payment = await DsaPayment.findOne({
    userId: req.user.userId,
    razorpayOrderId: razorpay_order_id,
  });

  if (!payment) {
    return res.status(404).json({ success: false, message: "DSA payment order not found." });
  }

  if (payment.status === "paid") {
    const entitlement = await getActiveEntitlement(req.user.userId);
    return successResponse({
      res,
      message: "DSA Premium payment is already verified.",
      data: { paymentStatus: "paid", premium: Boolean(entitlement), expiresAt: entitlement?.expiresAt || null },
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  const supplied = razorpay_signature.trim().toLowerCase();
  const expected = expectedSignature.toLowerCase();
  const suppliedBuffer = Buffer.from(supplied, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(400).json({ success: false, message: "Invalid payment signature." });
  }

  const [order, razorpayPayment] = await Promise.all([
    razorpay.orders.fetch(razorpay_order_id),
    razorpay.payments.fetch(razorpay_payment_id),
  ]);

  const expectedAmount = Math.round(payment.amount * 100);
  const valid =
    order.status === "paid" &&
    razorpayPayment.status === "captured" &&
    razorpayPayment.order_id === razorpay_order_id &&
    Number(order.amount) === expectedAmount &&
    Number(razorpayPayment.amount) === expectedAmount &&
    order.currency === payment.currency &&
    razorpayPayment.currency === payment.currency;

  if (!valid) {
    return res.status(400).json({ success: false, message: "Payment could not be verified." });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + DURATION_DAYS * 24 * 60 * 60 * 1000);

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.status = "paid";
  payment.paidAt = now;
  await payment.save();

  await DsaEntitlement.findOneAndUpdate(
    { userId: req.user.userId },
    {
      $set: {
        accessType: "PREMIUM",
        source: "DSA_SUBSCRIPTION",
        startsAt: now,
        expiresAt,
        isActive: true,
      },
      $setOnInsert: { userId: req.user.userId },
    },
    { upsert: true, new: true }
  );

  return successResponse({
    res,
    message: "DSA Premium activated successfully.",
    data: {
      paymentStatus: "paid",
      premium: true,
      plan: PLAN,
      startsAt: now,
      expiresAt,
    },
  });
});
