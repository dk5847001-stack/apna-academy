import { Router } from "express";
import {
  aiProviderModels,
  aiStatus,
  chatWithAI,
} from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Phase 1 keeps AI endpoints authenticated. Public/guest access is added in Phase 2
// after dedicated guest quotas and abuse protection are implemented.
router.use(authenticate);

router.get("/status", aiStatus);
router.get("/provider/models", aiProviderModels);
router.post("/chat", chatWithAI);

export default router;
