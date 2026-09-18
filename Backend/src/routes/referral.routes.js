import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { getMyReferral } from "../controllers/referral.controller.js";

const router = Router();

router.get("/me", authenticate, getMyReferral);

export default router;
