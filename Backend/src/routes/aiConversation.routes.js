import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireVerifiedAIUser } from "../middleware/aiAuth.middleware.js";
import { createAuthenticatedAIRateLimiter } from "../middleware/aiAuthenticatedRateLimit.middleware.js";
import { createAIConcurrencyLimiter } from "../middleware/aiConcurrency.middleware.js";
import { AI_CONFIG } from "../config/ai.js";
import {
  deleteAIConversation,
  getAIConversationMessages,
  getAIConversations,
  patchAIConversation,
  postAIConversation,
  postAIConversationMessage,
} from "../controllers/aiConversation.controller.js";

const router = Router();
router.use(authenticate, requireVerifiedAIUser);

router.get("/", getAIConversations);
router.post("/", postAIConversation);
router.get("/:conversationId/messages", getAIConversationMessages);
router.patch("/:conversationId", patchAIConversation);
router.delete("/:conversationId", deleteAIConversation);

router.post(
  "/:conversationId/messages",
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
  postAIConversationMessage
);

export default router;
