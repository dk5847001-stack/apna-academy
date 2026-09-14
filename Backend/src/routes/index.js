import { Router } from "express";

import authRoutes from "./auth.routes.js";
import courseRoutes from "./course.routes.js";
import paymentRoutes from "./payment.routes.js";
import learningRoutes from "./learning.routes.js";
import progressRoutes from "./progress.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import certificateRoutes from "./certificate.routes.js";
import notificationRoutes from "./notification.routes.js";
import profileRoutes from "./profile.routes.js";
import supportRoutes from "./support.routes.js";
import adminCourseRoutes from "./admin.course.routes.js";

const router = Router();

/* =========================================================
   API HEALTH CHECK
========================================================= */

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ApnaAcademy API v1 is working 🚀",
  });
});

/* =========================================================
   API ROUTES
========================================================= */

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/payments", paymentRoutes);
router.use("/learning", learningRoutes);
router.use("/progress", progressRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/certificates", certificateRoutes);
router.use("/notifications", notificationRoutes);
router.use("/profile", profileRoutes);
router.use("/support", supportRoutes);
router.use("/admin/courses", adminCourseRoutes);

export default router;
