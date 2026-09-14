import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listPurchases, getPurchase } from "../controllers/admin.purchase.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listPurchases);
router.get("/:purchaseId", getPurchase);
export default router;
