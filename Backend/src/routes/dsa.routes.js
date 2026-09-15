import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaProblem, getDsaProgress, listDsaProblems } from "../controllers/dsa.controller.js";

const router = Router();

router.use(authenticate);
router.get("/problems", listDsaProblems);
router.get("/problems/:slug", getDsaProblem);
router.get("/progress", getDsaProgress);

export default router;
