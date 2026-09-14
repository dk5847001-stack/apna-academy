import { Router } from "express";

import {
  register,
  login,
  me,
  logout,
  resendVerificationCode,
  verifyRegistrationEmail,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/register/resend-otp", resendVerificationCode);

router.post("/register/verify-otp", verifyRegistrationEmail);

router.post("/login", login);

router.get("/me", authenticate, me);

router.post("/logout", logout);

export default router;
