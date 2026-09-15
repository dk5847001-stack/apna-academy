import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import {
  createDsaPremiumOrder,
  getDsaSubscription,
  verifyDsaPremiumPayment,
} from "../controllers/dsa.payment.controller.js";

const router = Router();

router.use(authenticate);
router.get("/subscription", getDsaSubscription);
router.post("/create-order", createDsaPremiumOrder);
router.post("/verify", verifyDsaPremiumPayment);

export default router;
