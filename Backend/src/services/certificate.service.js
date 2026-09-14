import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";

import { generateCertificatePdf } from "../utils/certificatePdf.js";
import { generateCertificateQr } from "../utils/certificateQr.js";

const BACKEND_PUBLIC_URL = process.env.BACKEND_PUBLIC_URL || "http://localhost:5000";
const COURSE_PUBLIC_URL = process.env.COURSE_PUBLIC_URL || process.env.FRONTEND_URL || "http://localhost:5173";
const CERTIFICATE_OUTPUT_DIRECTORY = path.resolve(process.cwd(), "public", "certificates");

const isPurchaseActive = (purchase) => {
  if (!purchase || purchase.paymentStatus !== "paid") return false;
  if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) return false;
  return true;
};

const normalizeName = (name) => String(name || "").trim().replace(/\s+/g, " ");
const generateCertificateId = () => `APNA-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
const buildCertificateFileName = (certificateId) => `${certificateId}.pdf`;
const buildCertificateQrFileName = (certificateId) => `${certificateId}-qr.png`;

const removeGeneratedFile = async (filePath) => {
  if (!filePath) return;
  try { await fs.unlink(filePath); } catch (error) {
    if (error?.code !== "ENOENT") console.error("Certificate file cleanup failed:", error);
  }
};

const buildVerificationUrl = (certificateId) => `${COURSE_PUBLIC_URL.replace(/\/$/, "")}/certificate/verify/${encodeURIComponent(certificateId)}`;
const buildCertificateUrl = (certificateId) => `${BACKEND_PUBLIC_URL.replace(/\/$/, "")}/certificates/${encodeURIComponent(buildCertificateFileName(certificateId))}`;
const buildQrCodeUrl = (certificateId) => `${BACKEND_PUBLIC_URL.replace(/\/$/, "")}/certificates/${encodeURIComponent(buildCertificateQrFileName(certificateId))}`;

const getAssessmentStatus = async (userId, courseId) => {
  const assessment = await Assessment.findOne({ course: courseId, isPublished: true }).select("_id title passingScore").lean();
  if (!assessment) return { required: false, configured: false, passed: false, score: null, passingScore: null, attempts: 0 };

  const latestPassed = await AssessmentAttempt.findOne({ user: userId, course: courseId, assessment: assessment._id, passed: true })
    .sort({ createdAt: -1 })
    .select("score passed submittedAt")
    .lean();

  const latestAttempt = await AssessmentAttempt.findOne({ user: userId, course: courseId, assessment: assessment._id })
    .sort({ createdAt: -1 })
    .select("score passed submittedAt")
    .lean();

  return {
    required: true,
    configured: true,
    passed: Boolean(latestPassed),
    score: latestPassed?.score ?? latestAttempt?.score ?? null,
    passingScore: assessment.passingScore,
    assessmentId: assessment._id,
    title: assessment.title,
    submittedAt: latestPassed?.submittedAt ?? latestAttempt?.submittedAt ?? null,
  };
};

export const getUserCertificate = async (userId, courseId) => {
  const certificate = await Certificate.findOne({ user: userId, course: courseId }).populate("course", "title slug thumbnail").lean();
  return certificate || null;
};

export const getCertificateEligibility = async (userId, courseId) => {
  const [user, course, progress, certificate, purchases] = await Promise.all([
    User.findById(userId).select("name email"),
    Course.findOne({ _id: courseId, isPublished: true }).lean(),
    Progress.findOne({ user: userId, course: courseId }).lean(),
    Certificate.findOne({ user: userId, course: courseId }).populate("course", "title slug thumbnail").lean(),
    Purchase.find({ user: userId, course: courseId, paymentStatus: "paid" }).sort({ purchasedAt: -1 }),
  ]);

  if (!user) return { eligible: false, alreadyIssued: false, reason: "USER_NOT_FOUND", progress: null, assessment: null, certificate: null };
  if (!course) return { eligible: false, alreadyIssued: false, reason: "COURSE_NOT_FOUND", progress: null, assessment: null, certificate: null };

  const progressData = progress ? { overallProgress: progress.overallProgress, isCompleted: progress.isCompleted, completedAt: progress.completedAt } : null;

  if (certificate) {
    return { eligible: true, alreadyIssued: true, reason: "CERTIFICATE_ALREADY_ISSUED", progress: progressData, assessment: null, certificate };
  }

  const activePurchase = purchases.find(isPurchaseActive);
  if (!activePurchase) return { eligible: false, alreadyIssued: false, reason: "COURSE_NOT_PURCHASED", progress: progressData, assessment: null, certificate: null };

  const overallProgress = Number(progress?.overallProgress || 0);
  const isCompleted = progress?.isCompleted === true || overallProgress >= 100;
  if (!isCompleted) return { eligible: false, alreadyIssued: false, reason: "COURSE_NOT_COMPLETED", progress: { overallProgress, isCompleted, completedAt: progress?.completedAt || null }, assessment: null, certificate: null };

  const assessment = await getAssessmentStatus(userId, courseId);
  if (assessment.required && !assessment.passed) {
    return { eligible: false, alreadyIssued: false, reason: "ASSESSMENT_NOT_PASSED", progress: { overallProgress, isCompleted, completedAt: progress?.completedAt || null }, assessment, certificate: null };
  }

  return { eligible: true, alreadyIssued: false, reason: "CERTIFICATE_ELIGIBLE", progress: { overallProgress, isCompleted, completedAt: progress?.completedAt || null }, assessment, certificate: null };
};

export const createCertificate = async ({ userId, courseId, recipientName }) => {
  const normalizedName = normalizeName(recipientName);
  if (!normalizedName) { const error = new Error("Certificate name is required."); error.statusCode = 400; throw error; }
  if (normalizedName.length > 100) { const error = new Error("Certificate name cannot exceed 100 characters."); error.statusCode = 400; throw error; }

  const [user, course, progress, existingCertificate, purchases] = await Promise.all([
    User.findById(userId).select("name email"),
    Course.findOne({ _id: courseId, isPublished: true }),
    Progress.findOne({ user: userId, course: courseId }),
    Certificate.findOne({ user: userId, course: courseId }),
    Purchase.find({ user: userId, course: courseId, paymentStatus: "paid" }).sort({ purchasedAt: -1 }),
  ]);

  if (!user) { const error = new Error("User not found."); error.statusCode = 404; throw error; }
  if (!course) { const error = new Error("Course not found."); error.statusCode = 404; throw error; }

  if (existingCertificate) return existingCertificate;

  const activePurchase = purchases.find(isPurchaseActive);
  if (!activePurchase) { const error = new Error("You must purchase this course before receiving a certificate."); error.statusCode = 403; throw error; }

  const overallProgress = Number(progress?.overallProgress || 0);
  const isCompleted = progress?.isCompleted === true || overallProgress >= 100;
  if (!isCompleted) { const error = new Error("Complete the course before receiving your certificate."); error.statusCode = 403; throw error; }

  const assessment = await getAssessmentStatus(userId, courseId);
  if (assessment.required && !assessment.passed) {
    const error = new Error(`Pass the course assessment with at least ${assessment.passingScore}% before receiving your certificate.`);
    error.statusCode = 403;
    error.code = "ASSESSMENT_NOT_PASSED";
    throw error;
  }

  let certificateId = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateCertificateId();
    const duplicate = await Certificate.exists({ certificateId: candidate });
    if (!duplicate) { certificateId = candidate; break; }
  }
  if (!certificateId) { const error = new Error("Unable to generate a unique certificate ID."); error.statusCode = 500; throw error; }

  await fs.mkdir(CERTIFICATE_OUTPUT_DIRECTORY, { recursive: true });
  const issueDate = new Date();
  const verificationUrl = buildVerificationUrl(certificateId);
  const certificateFileName = buildCertificateFileName(certificateId);
  const qrFileName = buildCertificateQrFileName(certificateId);
  const certificateFilePath = path.join(CERTIFICATE_OUTPUT_DIRECTORY, certificateFileName);
  const qrFilePath = path.join(CERTIFICATE_OUTPUT_DIRECTORY, qrFileName);
  let certificateUrl = "";
  let qrCodeUrl = "";

  try {
    await generateCertificateQr({ outputDirectory: CERTIFICATE_OUTPUT_DIRECTORY, certificateId, verificationUrl });
    qrCodeUrl = buildQrCodeUrl(certificateId);
    await generateCertificatePdf({ outputDirectory: CERTIFICATE_OUTPUT_DIRECTORY, certificateId, recipientName: normalizedName, courseTitle: course.title, issueDate, verificationUrl, qrCodePath: qrFilePath });
    certificateUrl = buildCertificateUrl(certificateId);
    await fs.access(qrFilePath);
    await fs.access(certificateFilePath);
  } catch (error) {
    await Promise.all([removeGeneratedFile(certificateFilePath), removeGeneratedFile(qrFilePath)]);
    console.error("Certificate PDF/QR generation failed:", error);
    const generationError = new Error("Unable to generate certificate files.");
    generationError.statusCode = 500;
    throw generationError;
  }

  try {
    return await Certificate.create({ user: userId, course: courseId, certificateId, recipientName: normalizedName, issueDate, certificateUrl, verificationUrl, qrCodeUrl, isValid: true });
  } catch (error) {
    await Promise.all([removeGeneratedFile(certificateFilePath), removeGeneratedFile(qrFilePath)]);
    throw error;
  }
};

export const verifyCertificate = async (certificateId) => {
  const normalizedId = String(certificateId || "").trim().toUpperCase();
  if (!normalizedId) return { valid: false, certificate: null };
  const certificate = await Certificate.findOne({ certificateId: normalizedId }).populate("course", "title slug thumbnail").populate("user", "name email").lean();
  if (!certificate || certificate.isValid !== true) return { valid: false, certificate: null };
  return { valid: true, certificate };
};
