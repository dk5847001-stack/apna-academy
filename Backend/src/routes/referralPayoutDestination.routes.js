import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getReferralPayoutDestinationController,
  saveReferralPayoutDestinationController,
  verifyReferralPayoutDestinationController,
  refreshReferralPayoutDestinationController,
} from "../controllers/referralPayoutDestination.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getReferralPayoutDestinationController);
router.post("/", saveReferralPayoutDestinationController);
router.post("/verify", verifyReferralPayoutDestinationController);
router.get("/verification", refreshReferralPayoutDestinationController);

export default router;
