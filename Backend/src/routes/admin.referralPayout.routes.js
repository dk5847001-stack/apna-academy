import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  listAdminReferralPayoutsController,
  approveAdminReferralPayoutController,
  rejectAdminReferralPayoutController,
  processAdminReferralPayoutController,
  reconcileAdminReferralPayoutController,
  retryAdminReferralPayoutController,
} from "../controllers/admin.referralPayout.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", listAdminReferralPayoutsController);
router.post("/:payoutId/approve", approveAdminReferralPayoutController);
router.post("/:payoutId/reject", rejectAdminReferralPayoutController);
router.post("/:payoutId/process", processAdminReferralPayoutController);
router.post("/:payoutId/reconcile", reconcileAdminReferralPayoutController);
router.post("/:payoutId/retry", retryAdminReferralPayoutController);

export default router;
