import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getAnalytics } from "../controllers/admin.analytics.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", getAnalytics);
export default router;
