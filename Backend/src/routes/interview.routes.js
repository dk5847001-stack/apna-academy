import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { completeInterviewController, createInterviewController, getInterviewHistoryController, getInterviewResultController, submitInterviewAnswerController } from "../controllers/interview.controller.js";
import { createRateLimiter } from "../middleware/security.middleware.js";

const router = Router();
const interviewAiLimiter = createRateLimiter({
  windowMs: Number(process.env.INTERVIEW_AI_RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.INTERVIEW_AI_RATE_LIMIT_MAX || 20),
  keyPrefix: "interview-ai",
});

router.use(authenticate);
router.use(interviewAiLimiter);
router.post("/sessions", createInterviewController);
router.post("/sessions/:sessionId/answers", submitInterviewAnswerController);
router.post("/sessions/:sessionId/complete", completeInterviewController);
router.get("/sessions/:sessionId/result", getInterviewResultController);
router.get("/history", getInterviewHistoryController);

export default router;
