import api from "./api";
import { COURSE_URL } from "../constants/config";

const extractData = (response, fallbackMessage) => {
  if (!response?.data?.success) {
    throw new Error(
      response?.data?.message || fallbackMessage
    );
  }

  return response.data.data;
};

const buildVerificationUrl = (certificateId) =>
  certificateId
    ? `${COURSE_URL.replace(/\/$/, "")}/certificate/verify/${encodeURIComponent(certificateId)}`
    : "";

const normalizeCertificate = (certificate) => {
  if (!certificate) return null;

  const certificateId = certificate.certificateId || "";

  return {
    ...certificate,
    certificateId,
    recipientName: certificate.recipientName || "",
    issueDate: certificate.issueDate || null,
    certificateUrl: certificate.certificateUrl || "",
    verificationUrl: buildVerificationUrl(certificateId) || certificate.verificationUrl || "",
    qrCodeUrl: certificate.qrCodeUrl || "",
    isValid: certificate.isValid !== false,
    course: certificate.course || null,
  };
};

export const getCertificateStatus = async (courseId) => {
  if (!courseId) throw new Error("Course ID is required.");

  const response = await api.get(
    `/certificates/courses/${encodeURIComponent(courseId)}/status`
  );

  const data = extractData(
    response,
    "Unable to load certificate status."
  );

  return {
    eligible: Boolean(data?.eligible),
    alreadyIssued: Boolean(data?.alreadyIssued),
    reason: data?.reason || "",
    progress: data?.progress || null,
    certificate: normalizeCertificate(data?.certificate),
  };
};

export const issueCertificate = async ({ courseId, recipientName }) => {
  if (!courseId) throw new Error("Course ID is required.");
  if (!recipientName?.trim()) {
    throw new Error("Certificate name is required.");
  }

  const response = await api.post(
    `/certificates/courses/${encodeURIComponent(courseId)}`,
    { recipientName: recipientName.trim() }
  );

  return normalizeCertificate(
    extractData(response, "Unable to issue certificate.")
  );
};

const certificateService = {
  getCertificateStatus,
  issueCertificate,
};

export default certificateService;
