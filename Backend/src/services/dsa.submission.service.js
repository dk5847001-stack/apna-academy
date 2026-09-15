import crypto from "node:crypto";
import DsaProblem from "../models/DsaProblem.js";
import DsaSubmission from "../models/DsaSubmission.js";
import DsaTestCase from "../models/DsaTestCase.js";
import { hasPremiumAccess } from "./dsa.service.js";

const MAX_CODE_LENGTH = 50000;
const ALLOWED_LANGUAGES = new Set(["Java", "C++", "Python", "JavaScript"]);

const safeEqual = (left = "", right = "") => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const judgeRequest = async (submission, problem, testCases) => {
  const judgeUrl = process.env.JUDGE_SERVICE_URL?.trim();
  const judgeSecret = process.env.JUDGE_SERVICE_SECRET?.trim();

  if (!judgeUrl || !judgeSecret) {
    return { configured: false };
  }

  const response = await fetch(`${judgeUrl.replace(/\/$/, "")}/v1/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Judge-Secret": judgeSecret,
    },
    body: JSON.stringify({
      submissionId: String(submission._id),
      problem: {
        id: String(problem._id),
        slug: problem.slug,
        language: submission.language,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
      },
      code: submission.code,
      testCases: testCases.map((testCase) => ({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
      })),
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Judge service rejected the job with status ${response.status}.`);
  }

  return { configured: true, queued: true };
};

export const createSubmission = async ({ userId, problemSlug, language, code }) => {
  const normalizedSlug = String(problemSlug || "").trim().toLowerCase();
  const normalizedLanguage = String(language || "").trim();
  const sourceCode = typeof code === "string" ? code : "";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
    const error = new Error("Invalid problem slug.");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_LANGUAGES.has(normalizedLanguage)) {
    const error = new Error("Unsupported programming language.");
    error.statusCode = 400;
    throw error;
  }

  if (!sourceCode.trim()) {
    const error = new Error("Code is required.");
    error.statusCode = 400;
    throw error;
  }

  if (sourceCode.length > MAX_CODE_LENGTH) {
    const error = new Error(`Code cannot exceed ${MAX_CODE_LENGTH} characters.`);
    error.statusCode = 400;
    throw error;
  }

  const problem = await DsaProblem.findOne({ slug: normalizedSlug, status: "PUBLISHED" })
    .select("_id slug title isPremium supportedLanguages timeLimitMs memoryLimitMb")
    .lean();

  if (!problem) {
    const error = new Error("Problem not found.");
    error.statusCode = 404;
    throw error;
  }

  if (problem.isPremium && !(await hasPremiumAccess(userId))) {
    const error = new Error("Premium access is required for this problem.");
    error.statusCode = 403;
    throw error;
  }

  if (!problem.supportedLanguages.includes(normalizedLanguage)) {
    const error = new Error(`This problem does not support ${normalizedLanguage}.`);
    error.statusCode = 400;
    throw error;
  }

  const testCases = await DsaTestCase.find({ problemId: problem._id })
    .select("input expectedOutput")
    .sort({ order: 1 })
    .lean();

  if (testCases.length === 0) {
    const error = new Error("This problem has no judge test cases configured.");
    error.statusCode = 503;
    throw error;
  }

  const submission = await DsaSubmission.create({
    userId,
    problemId: problem._id,
    language: normalizedLanguage,
    code: sourceCode,
    status: "Pending",
    totalTests: testCases.length,
  });

  try {
    const result = await judgeRequest(submission, problem, testCases);

    if (!result.configured) {
      await DsaSubmission.findByIdAndUpdate(submission._id, {
        status: "Internal Error",
        judgeMessage: "Secure judge service is not configured.",
      });
      const error = new Error("Secure judge service is not configured yet.");
      error.statusCode = 503;
      throw error;
    }

    return await DsaSubmission.findById(submission._id).lean();
  } catch (error) {
    if (error.statusCode === 503) throw error;

    await DsaSubmission.findByIdAndUpdate(submission._id, {
      status: "Internal Error",
      judgeMessage: "Unable to queue submission securely.",
    });
    const wrapped = new Error("Unable to queue submission securely.");
    wrapped.statusCode = 503;
    throw wrapped;
  }
};

export const getSubmission = async ({ userId, submissionId }) => {
  if (!/^[a-f0-9]{24}$/i.test(String(submissionId || ""))) {
    const error = new Error("Invalid submission id.");
    error.statusCode = 400;
    throw error;
  }

  const submission = await DsaSubmission.findOne({ _id: submissionId, userId })
    .populate("problemId", "slug title difficulty")
    .lean();

  if (!submission) {
    const error = new Error("Submission not found.");
    error.statusCode = 404;
    throw error;
  }

  return submission;
};

export const isValidJudgeSecret = (providedSecret) => {
  const configuredSecret = process.env.JUDGE_SERVICE_SECRET?.trim();
  if (!configuredSecret || !providedSecret) return false;
  return safeEqual(providedSecret, configuredSecret);
};
