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
import adminUserRoutes from "./admin.user.routes.js";
import adminPurchaseRoutes from "./admin.purchase.routes.js";
import adminProgressRoutes from "./admin.progress.routes.js";
import adminCertificateRoutes from "./admin.certificate.routes.js";
import adminNotificationRoutes from "./admin.notification.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "ApnaAcademy API v1 is working 🚀" });
});

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
router.use("/admin/users", adminUserRoutes);
router.use("/admin/purchases", adminPurchaseRoutes);
router.use("/admin/progress", adminProgressRoutes);
router.use("/admin/certificates", adminCertificateRoutes);
router.use("/admin/notifications", adminNotificationRoutes);

export default router;
