import api from "./api";

/* =========================================================
   NORMALIZE CERTIFICATE
========================================================= */

function normalizeCertificate(
  certificate
) {
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

/* =========================================================
   NORMALIZE CERTIFICATE STATUS
========================================================= */

function normalizeCertificateStatus(
  data
) {
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

  if (
    !response?.data?.success
  ) {
    throw new Error(
      response?.data?.message ||
        "Unable to load certificate status."
    );
  }

  return normalizeCertificateStatus(
    response.data.data
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

  if (
    !response?.data?.success
  ) {
    throw new Error(
      response?.data?.message ||
        "Unable to load certificate."
    );
  }

  return normalizeCertificate(
    response.data.data
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

  if (
    !response?.data?.success
  ) {
    throw new Error(
      response?.data?.message ||
        "Unable to issue certificate."
    );
  }

  return normalizeCertificate(
    response.data.data
  );
}

/* =========================================================
   PUBLIC CERTIFICATE VERIFICATION
========================================================= */

export async function verifyCertificate(
  certificateId
) {
  const normalizedId =
    String(
      certificateId || ""
    ).trim();

  if (!normalizedId) {
    throw new Error(
      "Certificate ID is required."
    );
  }

  const response =
    await api.get(
      `/certificates/verify/${encodeURIComponent(
        normalizedId
      )}`
    );

  if (
    !response?.data?.success
  ) {
    throw new Error(
      response?.data?.message ||
        "Certificate verification failed."
    );
  }

  const data =
    response.data.data;

  return {
    valid:
      Boolean(data?.valid),

    certificate:
      normalizeCertificate(
        data?.certificate
      ),
  };
}