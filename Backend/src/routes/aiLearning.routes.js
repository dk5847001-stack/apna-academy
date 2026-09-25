import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireVerifiedAIUser } from "../middleware/aiAuth.middleware.js";
import { createAuthenticatedAIRateLimiter } from "../middleware/aiAuthenticatedRateLimit.middleware.js";
import { createAIConcurrencyLimiter } from "../middleware/aiConcurrency.middleware.js";
import { AI_CONFIG } from "../config/ai.js";
import {
  codeReview,
  explainTopic,
  practiceQuiz,
  studyPlan,
  summarizeLesson,
} from "../controllers/aiLearning.controller.js";

const router = Router();
router.use(authenticate, requireVerifiedAIUser);

const rateLimiter = createAuthenticatedAIRateLimiter({
  windowMs: AI_CONFIG.authWindowMs,
  maxRequests: AI_CONFIG.authWindowRequests,
  dailyWindowMs: AI_CONFIG.authDailyWindowMs,
  dailyMaxRequests: AI_CONFIG.authDailyRequests,
});

const concurrencyLimiter = createAIConcurrencyLimiter({
  maxPerUser: AI_CONFIG.authMaxConcurrentUser,
  maxPerIp: AI_CONFIG.authMaxConcurrentIp,
});

router.post("/courses/:courseId/explain", rateLimiter, concurrencyLimiter, explainTopic);
router.post("/courses/:courseId/summarize", rateLimiter, concurrencyLimiter, summarizeLesson);
router.post("/courses/:courseId/quiz", rateLimiter, concurrencyLimiter, practiceQuiz);
router.post("/courses/:courseId/study-plan", rateLimiter, concurrencyLimiter, studyPlan);
router.post("/courses/:courseId/code-review", rateLimiter, concurrencyLimiter, codeReview);

export default router;
