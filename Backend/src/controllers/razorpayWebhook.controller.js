import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import RazorpayWebhookEvent from "../models/RazorpayWebhookEvent.js";
import Purchase from "../models/Purchase.js";
import {
  markPaymentFailed,
  reconcileCapturedPayment,
} from "../services/razorpayPaymentReconciliation.service.js";

const verifyWebhookSignature = (rawBody, signature) => {
  if (!Buffer.isBuffer(rawBody) || !signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const supplied = String(signature).trim().toLowerCase();
  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(supplied, "hex");

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
};

export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.get("x-razorpay-signature");

  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Razorpay webhook signature.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid Razorpay webhook payload.",
    });
  }

  const event = String(payload?.event || "");
  const eventId = String(req.get("x-razorpay-event-id") || "").trim();

  if (!eventId) {
    return res.status(400).json({
      success: false,
      message: "Missing Razorpay webhook event id.",
    });
  }

  if (!["payment.captured", "payment.failed"].includes(event)) {
    return res.status(200).json({
      success: true,
      ignored: true,
      event,
    });
  }

  try {
    await RazorpayWebhookEvent.create({
      eventId,
      event,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(200).json({
        success: true,
        duplicate: true,
      });
    }
    throw error;
  }

  const paymentEntity = payload?.payload?.payment?.entity;
  const paymentId = paymentEntity?.id;
  const orderId = paymentEntity?.order_id;

  if (!paymentId || !orderId) {
    await RazorpayWebhookEvent.deleteOne({ eventId });
    return res.status(400).json({
      success: false,
      message: "Razorpay payment identifiers are missing.",
    });
  }

  try {
    const purchase = await Purchase.findOne({
      razorpayOrderId: orderId,
    });

    if (!purchase) {
      return res.status(200).json({
        success: true,
        ignored: true,
        reason: "purchase_not_found",
      });
    }

    if (event === "payment.failed") {
      await markPaymentFailed({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      });

      return res.status(200).json({
        success: true,
        processed: true,
        event,
      });
    }

    // Never trust webhook payload amounts/status alone. Re-fetch both entities
    // from Razorpay before granting access.
    const [razorpayOrder, razorpayPayment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);

    const expectedAmount = Math.round(Number(purchase.amount) * 100);

    const valid =
      razorpayPayment.order_id === orderId &&
      Number(razorpayOrder.amount) === expectedAmount &&
      Number(razorpayPayment.amount) === expectedAmount &&
      razorpayOrder.currency === purchase.currency &&
      razorpayPayment.currency === purchase.currency &&
      razorpayPayment.status === "captured" &&
      razorpayOrder.status === "paid";

    if (!valid) {
      throw new Error("Razorpay webhook payment validation failed.");
    }

    await reconcileCapturedPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });

    return res.status(200).json({
      success: true,
      processed: true,
      event,
    });
  } catch (error) {
    // Remove the event marker so Razorpay can retry the webhook safely.
    await RazorpayWebhookEvent.deleteOne({ eventId }).catch(() => {});
    throw error;
  }
};
