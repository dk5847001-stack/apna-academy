import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getAdminMessage, listAdminMessages, updateAdminMessage } from "../controllers/contactMessage.controller.js";
const router=Router(); router.use(authenticate,requireAdmin); router.get("/",listAdminMessages); router.get("/:messageId",getAdminMessage); router.patch("/:messageId",updateAdminMessage); export default router;
