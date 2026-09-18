import express, { Router } from "express";
import { handleRazorpayXReferralWebhook } from "../controllers/referralWebhook.controller.js";

const router = Router();

router.post(
  "/razorpayx",
  express.raw({ type: "application/json", limit: "100kb" }),
  handleRazorpayXReferralWebhook
);

export default router;
