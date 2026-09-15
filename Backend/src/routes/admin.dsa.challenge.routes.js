import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  createDailyChallenge,
  createStudyPlan,
  deleteDailyChallenge,
  deleteStudyPlan,
  listDailyChallenges,
  listStudyPlansAdmin,
  updateDailyChallenge,
  updateStudyPlan,
} from "../controllers/admin.dsa.challenge.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/daily-challenges", listDailyChallenges);
router.post("/daily-challenges", createDailyChallenge);
router.patch("/daily-challenges/:challengeId", updateDailyChallenge);
router.delete("/daily-challenges/:challengeId", deleteDailyChallenge);

router.get("/study-plans", listStudyPlansAdmin);
router.post("/study-plans", createStudyPlan);
router.patch("/study-plans/:planId", updateStudyPlan);
router.delete("/study-plans/:planId", deleteStudyPlan);

export default router;
