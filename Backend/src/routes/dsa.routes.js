import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaCompanies, getDsaCompany, getDsaProblem, getDsaProgress, getDsaSeoIndexController, getDsaTopics, listDsaProblems } from "../controllers/dsa.controller.js";
import { getDsaDailyChallenge, getDsaStudyPlan, getDsaStudyPlans } from "../controllers/dsa.challenge.controller.js";

const router = Router();

// Public metadata and discovery endpoints.
router.get("/seo-index", getDsaSeoIndexController);

router.use(authenticate);
router.get("/problems", listDsaProblems);
router.get("/problems/:slug", getDsaProblem);
router.get("/progress", getDsaProgress);
router.get("/topics", getDsaTopics);
router.get("/companies", getDsaCompanies);
router.get("/companies/:slug", getDsaCompany);
router.get("/daily-challenge", getDsaDailyChallenge);
router.get("/study-plans", getDsaStudyPlans);
router.get("/study-plans/:slug", getDsaStudyPlan);

export default router;
