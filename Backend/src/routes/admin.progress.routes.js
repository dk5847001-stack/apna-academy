import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listProgress, getProgress } from "../controllers/admin.progress.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listProgress);
router.get("/:progressId", getProgress);
export default router;
