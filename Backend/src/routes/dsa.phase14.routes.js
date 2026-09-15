import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaProgressDashboard, getDsaSubmissionHistory } from "../controllers/dsa.phase14.controller.js";

const router = Router();

router.use(authenticate);
router.get("/progress/dashboard", getDsaProgressDashboard);
router.get("/submissions", getDsaSubmissionHistory);

export default router;
