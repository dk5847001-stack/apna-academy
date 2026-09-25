import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireVerifiedAIUser } from "../middleware/aiAuth.middleware.js";
import { getMyUsage } from "../controllers/aiUsage.controller.js";

const router = Router();
router.use(authenticate, requireVerifiedAIUser);
router.get("/usage/me", getMyUsage);

export default router;
