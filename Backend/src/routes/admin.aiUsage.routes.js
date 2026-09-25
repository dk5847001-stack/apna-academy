import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getAdminUsage } from "../controllers/aiUsage.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/usage", getAdminUsage);

export default router;
