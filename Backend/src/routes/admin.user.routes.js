import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listUsers, getUser, getUserDetails, updateUser, getSecurityDetails, unfreezeSecurity, blockUser, unblockUser, activateUser, suspendUser } from "../controllers/admin.user.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listUsers);
router.get("/:userId/details", getUserDetails);
router.get("/:userId/security", getSecurityDetails);
router.post("/:userId/security/unfreeze", unfreezeSecurity);
router.post("/:userId/block", blockUser);
router.post("/:userId/unblock", unblockUser);
router.post("/:userId/activate", activateUser);
router.post("/:userId/suspend", suspendUser);
router.get("/:userId", getUser);
router.patch("/:userId", updateUser);
export default router;
