import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getDsaSubmission, submitDsaSolution } from "../controllers/dsa.submission.controller.js";

const router = Router();

router.use(authenticate);
router.post("/", submitDsaSolution);
router.get("/:id", getDsaSubmission);

export default router;
