import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createInterviewController, getInterviewHistoryController, getInterviewResultController, submitInterviewAnswerController } from "../controllers/interview.controller.js";

const router = Router();
router.use(authenticate);
router.post("/sessions", createInterviewController);
router.post("/sessions/:sessionId/answers", submitInterviewAnswerController);
router.get("/sessions/:sessionId/result", getInterviewResultController);
router.get("/history", getInterviewHistoryController);

export default router;
