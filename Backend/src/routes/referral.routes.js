import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyReferral,getMyReferralWalletController,requestReferralWithdrawalController,listReferralPayoutsController } from "../controllers/referral.controller.js";
const router=Router();
router.get("/me",authenticate,getMyReferral);
router.get("/wallet",authenticate,getMyReferralWalletController);
router.get("/payouts",authenticate,listReferralPayoutsController);
router.post("/withdraw",authenticate,requestReferralWithdrawalController);
export default router;