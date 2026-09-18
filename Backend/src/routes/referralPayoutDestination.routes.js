import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createRateLimiter } from "../middleware/security.middleware.js";
import {
  getReferralPayoutDestinationController,
  saveReferralPayoutDestinationController,
  verifyReferralPayoutDestinationController,
  refreshReferralPayoutDestinationController,
} from "../controllers/referralPayoutDestination.controller.js";

const router = Router();

const payoutDestinationMutationLimiter = createRateLimiter({
  windowMs: Number(process.env.REFERRAL_PAYOUT_DESTINATION_RATE_LIMIT_WINDOW_MS || 10 * 60_000),
  max: Number(process.env.REFERRAL_PAYOUT_DESTINATION_RATE_LIMIT_MAX || 5),
  keyPrefix: "referral-payout-destination",
});

router.use(authenticate);

router.get("/", getReferralPayoutDestinationController);
router.post("/", saveReferralPayoutDestinationController);
router.post("/verify", verifyReferralPayoutDestinationController);
router.get("/verification", refreshReferralPayoutDestinationController);

export default router;
