import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireVerifiedAIUser } from "../middleware/aiAuth.middleware.js";
import { getAICourseAccess } from "../controllers/aiCourse.controller.js";

const router = Router();

router.use(authenticate, requireVerifiedAIUser);
router.get("/:courseId/access", getAICourseAccess);

export default router;
