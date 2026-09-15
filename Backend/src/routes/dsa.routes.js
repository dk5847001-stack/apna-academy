import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaCompanies, getDsaProblem, getDsaProgress, getDsaTopics, listDsaProblems } from "../controllers/dsa.controller.js";

const router = Router();

router.use(authenticate);
router.get("/problems", listDsaProblems);
router.get("/problems/:slug", getDsaProblem);
router.get("/progress", getDsaProgress);
router.get("/topics", getDsaTopics);
router.get("/companies", getDsaCompanies);

export default router;
