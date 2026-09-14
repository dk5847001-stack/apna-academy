import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listSubscribers, updateSubscriber } from "../controllers/subscriber.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listSubscribers);
router.patch("/:subscriberId", updateSubscriber);
export default router;
