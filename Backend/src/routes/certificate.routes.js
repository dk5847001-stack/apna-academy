import { Router } from "express";

import {
  getCertificateStatus,
  getCertificate,
  issueCertificate,
  verifyCertificateId,
} from "../controllers/certificate.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   PROTECTED CERTIFICATE ROUTES
========================================================= */

/*
 * Get certificate eligibility/status
 * GET /api/v1/certificates/courses/:courseId/status
 */
router.get(
  "/courses/:courseId/status",
  authenticate,
  getCertificateStatus
);

/*
 * Get already issued certificate
 * GET /api/v1/certificates/courses/:courseId
 */
router.get(
  "/courses/:courseId",
  authenticate,
  getCertificate
);

/*
 * Issue/create certificate
 * POST /api/v1/certificates/courses/:courseId
 */
router.post(
  "/courses/:courseId",
  authenticate,
  issueCertificate
);

/* =========================================================
   PUBLIC CERTIFICATE VERIFICATION
========================================================= */

/*
 * Verify certificate without login
 * GET /api/v1/certificates/verify/:certificateId
 */
router.get(
  "/verify/:certificateId",
  verifyCertificateId
);

export default router;