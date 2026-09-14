import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { listCertificates, getCertificate, updateCertificate } from "../controllers/admin.certificate.controller.js";

const router = Router();
router.use(authenticate, requireAdmin);
router.get("/", listCertificates);
router.get("/:certificateId", getCertificate);
router.patch("/:certificateId", updateCertificate);
export default router;
