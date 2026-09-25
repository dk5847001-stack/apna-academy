import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { indexCourseAIKnowledge } from "../controllers/admin.ai.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.post("/courses/:courseId/index", indexCourseAIKnowledge);

export default router;
