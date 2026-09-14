import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listAssessments, getAssessment, createAssessment, updateAssessment, deleteAssessment } from "../controllers/admin.assessment.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listAssessments);
router.get("/:assessmentId", getAssessment);
router.post("/", createAssessment);
router.patch("/:assessmentId", updateAssessment);
router.delete("/:assessmentId", deleteAssessment);
export default router;
