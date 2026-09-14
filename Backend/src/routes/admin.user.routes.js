import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listUsers, getUser, getUserDetails, updateUser } from "../controllers/admin.user.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listUsers);
router.get("/:userId/details", getUserDetails);
router.get("/:userId", getUser);
router.patch("/:userId", updateUser);
export default router;
