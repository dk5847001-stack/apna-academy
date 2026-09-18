import { Router } from "express";

import {
  register,
  login,
  me,
  logout,
  resendVerificationCode,
  verifyRegistrationEmail,
  forgotPassword,
  resetPasswordController,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/register/resend-otp", resendVerificationCode);

router.post("/register/verify-otp", verifyRegistrationEmail);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPasswordController);

router.get("/me", authenticate, me);

router.post("/logout", authenticate, logout);

export default router;
