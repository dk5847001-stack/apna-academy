import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createRateLimiter } from "../middleware/security.middleware.js";
import { getMyReferral,getMyReferralWalletController,requestReferralWithdrawalController,listReferralPayoutsController } from "../controllers/referral.controller.js";
const router=Router();

const referralMutationLimiter = createRateLimiter({
  windowMs: Number(process.env.REFERRAL_MUTATION_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.REFERRAL_MUTATION_RATE_LIMIT_MAX || 8),
  keyPrefix: "referral-mutation",
});

const referralWithdrawalLimiter = createRateLimiter({
  windowMs: Number(process.env.REFERRAL_WITHDRAWAL_RATE_LIMIT_WINDOW_MS || 10 * 60_000),
  max: Number(process.env.REFERRAL_WITHDRAWAL_RATE_LIMIT_MAX || 3),
  keyPrefix: "referral-withdrawal",
});
router.get("/me",authenticate,getMyReferral);
router.get("/wallet",authenticate,getMyReferralWalletController);
router.get("/payouts",authenticate,listReferralPayoutsController);
router.post("/withdraw",authenticate,referralWithdrawalLimiter,requestReferralWithdrawalController);
export default router;