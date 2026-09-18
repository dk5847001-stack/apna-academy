import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import {
  getMyReferral,
  getMyReferralWalletController,
} from "../controllers/referral.controller.js";

const router = Router();

router.get("/me", authenticate, getMyReferral);
router.get("/wallet", authenticate, getMyReferralWalletController);

export default router;
