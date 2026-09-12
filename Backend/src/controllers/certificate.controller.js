import {
  createCertificate,
  getCertificateEligibility,
  getUserCertificate,
  verifyCertificate,
} from "../services/certificate.service.js";

import {
  successResponse,
} from "../utils/apiResponse.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

/* =========================================================
   GET CERTIFICATE ELIGIBILITY
========================================================= */

export const getCertificateStatus =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user?.userId;

      const { courseId } =
        req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message:
            "Course ID is required.",
        });
      }

      const result =
        await getCertificateEligibility(
          userId,
          courseId
        );

      return successResponse({
        res,
        message:
          "Certificate status loaded successfully.",
        data: result,
      });
    }
  );

/* =========================================================
   GET EXISTING USER CERTIFICATE
========================================================= */

export const getCertificate =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user?.userId;

      const { courseId } =
        req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message:
            "Course ID is required.",
        });
      }

      const certificate =
        await getUserCertificate(
          userId,
          courseId
        );

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate has not been issued yet.",
        });
      }

      return successResponse({
        res,
        message:
          "Certificate loaded successfully.",
        data: certificate,
      });
    }
  );

/* =========================================================
   CREATE CERTIFICATE
========================================================= */

export const issueCertificate =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user?.userId;

      const { courseId } =
        req.params;

      const { recipientName } =
        req.body || {};

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message:
            "Course ID is required.",
        });
      }

      if (
        typeof recipientName !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Certificate name is required.",
        });
      }

      const certificate =
        await createCertificate({
          userId,
          courseId,
          recipientName,
        });

      return successResponse({
        res,
        statusCode: 201,
        message:
          "Certificate issued successfully.",
        data: certificate,
      });
    }
  );

/* =========================================================
   PUBLIC CERTIFICATE VERIFICATION
========================================================= */

export const verifyCertificateId =
  asyncHandler(
    async (req, res) => {
      const { certificateId } =
        req.params;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message:
            "Certificate ID is required.",
        });
      }

      const result =
        await verifyCertificate(
          certificateId
        );

      if (!result.valid) {
        return res.status(404).json({
          success: false,
          message:
            "Certificate is invalid or does not exist.",
          data: result,
        });
      }

      return successResponse({
        res,
        message:
          "Certificate verified successfully.",
        data: result,
      });
    }
  );