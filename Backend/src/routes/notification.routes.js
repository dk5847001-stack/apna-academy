import { Router } from "express";

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);

router.patch(
  "/read-all",
  markAllAsRead
);

router.patch(
  "/:notificationId/read",
  markAsRead
);

export default router;
