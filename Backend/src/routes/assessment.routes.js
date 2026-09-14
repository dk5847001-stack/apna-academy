import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getAssessment, submitAssessment } from "../controllers/assessment.controller.js";

const router = Router();

router.use(authenticate);

router.get("/courses/:courseId", getAssessment);
router.post("/courses/:courseId/submit", submitAssessment);

export default router;
