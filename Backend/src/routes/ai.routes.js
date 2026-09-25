import { Router } from "express";
import {
  aiProviderModels,
  aiStatus,
  chatWithAI,
  chatWithGuestAI,
  publicAIStatus,
} from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { createGuestAIRateLimiter } from "../middleware/aiGuestRateLimit.middleware.js";
import { validatePublicAIRequest } from "../middleware/aiRequest.middleware.js";
import { requireVerifiedAIUser } from "../middleware/aiAuth.middleware.js";
import { createAuthenticatedAIRateLimiter } from "../middleware/aiAuthenticatedRateLimit.middleware.js";
import { createAIConcurrencyLimiter } from "../middleware/aiConcurrency.middleware.js";
import { AI_CONFIG } from "../config/ai.js";

const router = Router();

router.get("/public/status", publicAIStatus);

router.post(
  "/public/chat",
  createGuestAIRateLimiter({
    windowMs: AI_CONFIG.guestWindowMs,
    maxRequests: AI_CONFIG.guestWindowRequests,
    dailyMax: AI_CONFIG.guestDailyRequests,
  }),
  validatePublicAIRequest,
  chatWithGuestAI
);

router.use(authenticate);
router.get("/status", aiStatus);
router.get("/provider/models", aiProviderModels);

router.post(
  "/chat",
  requireVerifiedAIUser,
  createAuthenticatedAIRateLimiter({
    windowMs: AI_CONFIG.authWindowMs,
    maxRequests: AI_CONFIG.authWindowRequests,
    dailyWindowMs: AI_CONFIG.authDailyWindowMs,
    dailyMaxRequests: AI_CONFIG.authDailyRequests,
  }),
  createAIConcurrencyLimiter({
    maxPerUser: AI_CONFIG.authMaxConcurrentUser,
    maxPerIp: AI_CONFIG.authMaxConcurrentIp,
  }),
  chatWithAI
);

export default router;
