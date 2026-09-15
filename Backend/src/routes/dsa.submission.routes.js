import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaSubmission, receiveDsaJudgeResult, submitDsaSolution } from "../controllers/dsa.submission.controller.js";

const router = Router();

router.post("/:id/judge-result", receiveDsaJudgeResult);
router.use(authenticate);
router.post("/", submitDsaSolution);
router.get("/:id", getDsaSubmission);

export default router;
