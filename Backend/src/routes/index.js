import { Router } from "express";

import authRoutes from "./auth.routes.js";
import courseRoutes from "./course.routes.js";
import paymentRoutes from "./payment.routes.js";
import learningRoutes from "./learning.routes.js";
import progressRoutes from "./progress.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ApnaAcademy API v1 is working 🚀",
  });
});

router.use("/auth", authRoutes);

router.use("/courses", courseRoutes);

router.use("/payments", paymentRoutes);

router.use("/learning", learningRoutes);

router.use("/progress", progressRoutes);

router.use("/dashboard", dashboardRoutes);

export default router;