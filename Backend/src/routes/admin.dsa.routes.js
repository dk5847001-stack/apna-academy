import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  listTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
} from "../controllers/admin.dsa.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/problems", listProblems);
router.post("/problems", createProblem);
router.patch("/problems/:problemId", updateProblem);
router.delete("/problems/:problemId", deleteProblem);

router.get("/problems/:problemId/test-cases", listTestCases);
router.post("/problems/:problemId/test-cases", createTestCase);
router.patch("/test-cases/:testCaseId", updateTestCase);
router.delete("/test-cases/:testCaseId", deleteTestCase);

export default router;
