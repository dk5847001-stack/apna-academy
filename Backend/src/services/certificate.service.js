import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

import {
  generateCertificatePdf,
} from "../utils/certificatePdf.js";

import {
  generateCertificateQr,
} from "../utils/certificateQr.js";

/* =========================================================
   CONFIG
========================================================= */

const BACKEND_PUBLIC_URL =
  process.env.BACKEND_PUBLIC_URL ||
  "http://localhost:5000";

const COURSE_PUBLIC_URL =
  process.env.COURSE_PUBLIC_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const CERTIFICATE_OUTPUT_DIRECTORY =
  path.resolve(
    process.cwd(),
    "public",
    "certificates"
  );

/* =========================================================
   HELPERS
========================================================= */

const isPurchaseActive = (purchase) => {
  if (!purchase) {
    return false;
  }

  if (purchase.paymentStatus !== "paid") {
    return false;
  }

  if (
    purchase.expiresAt &&
    new Date(purchase.expiresAt) < new Date()
  ) {
    return false;
  }

  return true;
};

const normalizeName = (name) => {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ");
};

const generateCertificateId = () => {
  const randomPart = crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `APNA-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
};

const buildCertificateFileName = (
  certificateId
) => {
  return `${certificateId}.pdf`;
};

const buildCertificateQrFileName = (
  certificateId
) => {
  return `${certificateId}-qr.png`;
};

const removeGeneratedFile = async (
  filePath
) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error(
        "Certificate file cleanup failed:",
        error
      );
    }
  }
};

const buildVerificationUrl = (
  certificateId
) => {
  return `${COURSE_PUBLIC_URL.replace(
    /\/$/,
    ""
  )}/certificate/verify/${encodeURIComponent(
    certificateId
  )}`;
};

const buildCertificateUrl = (
  certificateId
) => {
  return `${BACKEND_PUBLIC_URL.replace(
    /\/$/,
    ""
  )}/certificates/${encodeURIComponent(
    buildCertificateFileName(
      certificateId
    )
  )}`;
};

const buildQrCodeUrl = (
  certificateId
) => {
  return `${BACKEND_PUBLIC_URL.replace(
    /\/$/,
    ""
  )}/certificates/${encodeURIComponent(
    buildCertificateQrFileName(
      certificateId
    )
  )}`;
};

/* =========================================================
   GET USER CERTIFICATE
========================================================= */

export const getUserCertificate = async (
  userId,
  courseId
) => {
  const certificate =
    await Certificate.findOne({
      user: userId,
      course: courseId,
    })
      .populate(
        "course",
        "title slug thumbnail"
      )
      .lean();

  return certificate || null;
};

/* =========================================================
   GET CERTIFICATE ELIGIBILITY
========================================================= */

export const getCertificateEligibility = async (
  userId,
  courseId
) => {
  const [
    user,
    course,
    progress,
    certificate,
    purchases,
  ] = await Promise.all([
    User.findById(userId).select(
      "name email"
    ),

    Course.findOne({
      _id: courseId,
      isPublished: true,
    }).lean(),

    Progress.findOne({
      user: userId,
      course: courseId,
    }).lean(),

    Certificate.findOne({
      user: userId,
      course: courseId,
    })
      .populate(
        "course",
        "title slug thumbnail"
      )
      .lean(),

    Purchase.find({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    }).sort({
      purchasedAt: -1,
    }),
  ]);

  if (!user) {
    return {
      eligible: false,
      alreadyIssued: false,
      reason: "USER_NOT_FOUND",
      progress: null,
      certificate: null,
    };
  }

  if (!course) {
    return {
      eligible: false,
      alreadyIssued: false,
      reason: "COURSE_NOT_FOUND",
      progress: null,
      certificate: null,
    };
  }

  if (certificate) {
    return {
      eligible: true,
      alreadyIssued: true,
      reason: "CERTIFICATE_ALREADY_ISSUED",
      progress: progress
        ? {
            overallProgress:
              progress.overallProgress,
            isCompleted:
              progress.isCompleted,
            completedAt:
              progress.completedAt,
          }
        : null,
      certificate,
    };
  }

  const activePurchase =
    purchases.find(isPurchaseActive);

  if (!activePurchase) {
    return {
      eligible: false,
      alreadyIssued: false,
      reason: "COURSE_NOT_PURCHASED",
      progress: progress
        ? {
            overallProgress:
              progress.overallProgress,
            isCompleted:
              progress.isCompleted,
            completedAt:
              progress.completedAt,
          }
        : null,
      certificate: null,
    };
  }

  const overallProgress = Number(
    progress?.overallProgress || 0
  );

  const isCompleted =
    progress?.isCompleted === true ||
    overallProgress >= 100;

  if (!isCompleted) {
    return {
      eligible: false,
      alreadyIssued: false,
      reason: "COURSE_NOT_COMPLETED",
      progress: {
        overallProgress,
        isCompleted,
        completedAt:
          progress?.completedAt || null,
      },
      certificate: null,
    };
  }

  return {
    eligible: true,
    alreadyIssued: false,
    reason: "CERTIFICATE_ELIGIBLE",
    progress: {
      overallProgress,
      isCompleted,
      completedAt:
        progress?.completedAt || null,
    },
    certificate: null,
  };
};

/* =========================================================
   CREATE CERTIFICATE
========================================================= */

export const createCertificate = async ({
  userId,
  courseId,
  recipientName,
}) => {
  const normalizedName =
    normalizeName(recipientName);

  if (!normalizedName) {
    const error = new Error(
      "Certificate name is required."
    );

    error.statusCode = 400;

    throw error;
  }

  if (normalizedName.length > 100) {
    const error = new Error(
      "Certificate name cannot exceed 100 characters."
    );

    error.statusCode = 400;

    throw error;
  }

  const [
    user,
    course,
    progress,
    existingCertificate,
    purchases,
  ] = await Promise.all([
    User.findById(userId).select(
      "name email"
    ),

    Course.findOne({
      _id: courseId,
      isPublished: true,
    }),

    Progress.findOne({
      user: userId,
      course: courseId,
    }),

    Certificate.findOne({
      user: userId,
      course: courseId,
    }),

    Purchase.find({
      user: userId,
      course: courseId,
      paymentStatus: "paid",
    }).sort({
      purchasedAt: -1,
    }),
  ]);

  if (!user) {
    const error = new Error(
      "User not found."
    );

    error.statusCode = 404;

    throw error;
  }

  if (!course) {
    const error = new Error(
      "Course not found."
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Certificate name is permanent.
   *
   * If a certificate already exists,
   * never overwrite it.
   */
  if (existingCertificate) {
    return existingCertificate;
  }

  const activePurchase =
    purchases.find(isPurchaseActive);

  if (!activePurchase) {
    const error = new Error(
      "You must purchase this course before receiving a certificate."
    );

    error.statusCode = 403;

    throw error;
  }

  const overallProgress = Number(
    progress?.overallProgress || 0
  );

  const isCompleted =
    progress?.isCompleted === true ||
    overallProgress >= 100;

  if (!isCompleted) {
    const error = new Error(
      "Complete the course before receiving your certificate."
    );

    error.statusCode = 403;

    throw error;
  }

  /* =======================================================
     GENERATE UNIQUE CERTIFICATE ID
  ======================================================= */

  let certificateId = "";

  for (
    let attempt = 0;
    attempt < 5;
    attempt += 1
  ) {
    const candidate =
      generateCertificateId();

    const duplicate =
      await Certificate.exists({
        certificateId: candidate,
      });

    if (!duplicate) {
      certificateId = candidate;
      break;
    }
  }

  if (!certificateId) {
    const error = new Error(
      "Unable to generate a unique certificate ID."
    );

    error.statusCode = 500;

    throw error;
  }

  /* =======================================================
     PREPARE CERTIFICATE FILES
  ======================================================= */

  await fs.mkdir(
    CERTIFICATE_OUTPUT_DIRECTORY,
    {
      recursive: true,
    }
  );

  const issueDate = new Date();

  const verificationUrl =
    buildVerificationUrl(
      certificateId
    );

  const certificateFileName =
    buildCertificateFileName(
      certificateId
    );

  const qrFileName =
    buildCertificateQrFileName(
      certificateId
    );

  const certificateFilePath =
    path.join(
      CERTIFICATE_OUTPUT_DIRECTORY,
      certificateFileName
    );

  const qrFilePath =
    path.join(
      CERTIFICATE_OUTPUT_DIRECTORY,
      qrFileName
    );

  let certificateUrl = "";
  let qrCodeUrl = "";

  try {
    /* =====================================================
       GENERATE QR CODE
    ===================================================== */

    await generateCertificateQr({
      outputDirectory:
        CERTIFICATE_OUTPUT_DIRECTORY,

      certificateId,

      verificationUrl,
    });

    qrCodeUrl =
      buildQrCodeUrl(
        certificateId
      );

    /* =====================================================
       GENERATE PDF CERTIFICATE
    ===================================================== */

    await generateCertificatePdf({
      outputDirectory:
        CERTIFICATE_OUTPUT_DIRECTORY,

      certificateId,

      recipientName:
        normalizedName,

      courseTitle:
        course.title,

      issueDate,

      verificationUrl,

      qrCodePath:
        qrFilePath,
    });

    certificateUrl =
      buildCertificateUrl(
        certificateId
      );

    /* =====================================================
       VERIFY GENERATED FILES EXIST
    ===================================================== */

    await fs.access(
      qrFilePath
    );

    await fs.access(
      certificateFilePath
    );
  } catch (error) {
    await Promise.all([
      removeGeneratedFile(
        certificateFilePath
      ),
      removeGeneratedFile(
        qrFilePath
      ),
    ]);

    console.error(
      "Certificate PDF/QR generation failed:",
      error
    );

    const generationError =
      new Error(
        "Unable to generate certificate files."
      );

    generationError.statusCode = 500;

    throw generationError;
  }

  /* =======================================================
     CREATE DATABASE RECORD
  ======================================================= */

  try {
    const certificate =
      await Certificate.create({
        user: userId,

        course: courseId,

        certificateId,

        recipientName:
          normalizedName,

        issueDate,

        certificateUrl,

        verificationUrl,

        qrCodeUrl,

        isValid: true,
      });

    return certificate;
  } catch (error) {
    /*
     * Database creation failed after files were generated.
     * Remove orphaned files.
     */

    await Promise.all([
      removeGeneratedFile(
        certificateFilePath
      ),
      removeGeneratedFile(
        qrFilePath
      ),
    ]);

    throw error;
  }
};

/* =========================================================
   VERIFY CERTIFICATE
========================================================= */

export const verifyCertificate = async (
  certificateId
) => {
  const normalizedId =
    String(certificateId || "")
      .trim()
      .toUpperCase();

  if (!normalizedId) {
    return {
      valid: false,
      certificate: null,
    };
  }

  const certificate =
    await Certificate.findOne({
      certificateId: normalizedId,
    })
      .populate(
        "course",
        "title slug thumbnail"
      )
      .populate(
        "user",
        "name email"
      )
      .lean();

  if (
    !certificate ||
    certificate.isValid !== true
  ) {
    return {
      valid: false,
      certificate: null,
    };
  }

  return {
    valid: true,
    certificate,
  };
};