import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listNotifications, createNotification, deleteNotification } from "../controllers/admin.notification.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listNotifications);
router.post("/", createNotification);
router.delete("/:notificationId", deleteNotification);
export default router;
