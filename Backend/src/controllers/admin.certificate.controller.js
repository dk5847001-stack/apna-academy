import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  getAdminCertificate,
  listAdminCertificates,
  updateAdminCertificate,
} from "../services/admin.certificate.service.js";

export const listCertificates = asyncHandler(async (req, res) => {
  const data = await listAdminCertificates({
    page: req.query?.page,
    limit: req.query?.limit,
    search: req.query?.search,
    courseId: req.query?.courseId,
    validity: req.query?.validity,
  });
  return successResponse({ res, message: "Certificates loaded successfully.", data });
});

export const getCertificate = asyncHandler(async (req, res) => {
  const data = await getAdminCertificate(req.params.certificateId);
  return successResponse({ res, message: "Certificate loaded successfully.", data });
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const data = await updateAdminCertificate({
    certificateId: req.params.certificateId,
    isValid: req.body?.isValid,
  });
  return successResponse({ res, message: "Certificate validity updated successfully.", data });
});
