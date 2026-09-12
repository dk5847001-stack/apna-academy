import api from "./api";

/* =========================================================
   NORMALIZERS
========================================================= */

function normalizeCertificate(certificate) {
  if (!certificate) {
    return null;
  }

  return {
    ...certificate,

    certificateId:
      certificate.certificateId || "",

    recipientName:
      certificate.recipientName || "",

    issueDate:
      certificate.issueDate || null,

    certificateUrl:
      certificate.certificateUrl || "",

    verificationUrl:
      certificate.verificationUrl || "",

    qrCodeUrl:
      certificate.qrCodeUrl || "",

    isValid:
      certificate.isValid !== false,

    course:
      certificate.course || null,
  };
}

function normalizeEligibility(data) {
  if (!data) {
    return {
      eligible: false,
      alreadyIssued: false,
      reason: "",
      progress: null,
      certificate: null,
    };
  }

  return {
    eligible:
      Boolean(data.eligible),

    alreadyIssued:
      Boolean(data.alreadyIssued),

    reason:
      data.reason || "",

    progress:
      data.progress || null,

    certificate:
      normalizeCertificate(
        data.certificate
      ),
  };
}

/* =========================================================
   GET CERTIFICATE STATUS
========================================================= */

export async function getCertificateStatus(
  courseId
) {
  if (!courseId) {
    throw new Error(
      "Course ID is required."
    );
  }

  const response =
    await api.get(
      `/certificates/courses/${courseId}/status`
    );

  return normalizeEligibility(
    response.data?.data
  );
}

/* =========================================================
   GET EXISTING CERTIFICATE
========================================================= */

export async function getCertificate(
  courseId
) {
  if (!courseId) {
    throw new Error(
      "Course ID is required."
    );
  }

  const response =
    await api.get(
      `/certificates/courses/${courseId}`
    );

  return normalizeCertificate(
    response.data?.data
  );
}

/* =========================================================
   ISSUE CERTIFICATE
========================================================= */

export async function issueCertificate({
  courseId,
  recipientName,
}) {
  if (!courseId) {
    throw new Error(
      "Course ID is required."
    );
  }

  if (
    typeof recipientName !==
      "string" ||
    !recipientName.trim()
  ) {
    throw new Error(
      "Certificate name is required."
    );
  }

  const response =
    await api.post(
      `/certificates/courses/${courseId}`,
      {
        recipientName:
          recipientName.trim(),
      }
    );

  return normalizeCertificate(
    response.data?.data
  );
}

/* =========================================================
   PUBLIC CERTIFICATE VERIFICATION
========================================================= */

export async function verifyCertificate(
  certificateId
) {
  if (!certificateId) {
    throw new Error(
      "Certificate ID is required."
    );
  }

  const response =
    await api.get(
      `/certificates/verify/${encodeURIComponent(
        certificateId.trim()
      )}`
    );

  return {
    valid:
      Boolean(
        response.data?.data?.valid
      ),

    certificate:
      normalizeCertificate(
        response.data?.data
          ?.certificate
      ),
  };
}