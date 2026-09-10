import { Router } from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Create Razorpay payment order
 *
 * POST /api/v1/payments/create-order
 *
 * Authentication required.
 */
router.post(
  "/create-order",
  authenticate,
  createPaymentOrder
);

/**
 * Verify Razorpay payment
 *
 * POST /api/v1/payments/verify
 *
 * Authentication required.
 */
router.post(
  "/verify",
  authenticate,
  verifyPayment
);

export default router;