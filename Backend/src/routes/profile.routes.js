import { Router } from "express";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getStudentProfile);
router.patch("/", authenticate, updateStudentProfile);

export default router;