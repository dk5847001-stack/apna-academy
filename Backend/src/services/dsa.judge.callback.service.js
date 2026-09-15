import DsaProgress from "../models/DsaProgress.js";
import DsaSubmission from "../models/DsaSubmission.js";

const FINAL_STATUSES = new Set([
  "Accepted",
  "Wrong Answer",
  "Compilation Error",
  "Runtime Error",
  "TLE",
  "MLE",
  "Runtime Limit",
  "Internal Error",
]);

const startOfUtcDay = (value) => {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const processJudgeResult = async ({ submissionId, status, passedTests = 0, totalTests, executionTimeMs = null, memoryUsedMb = null, judgeMessage = "" }) => {
  const normalizedStatus = String(status || "").trim();
  if (!FINAL_STATUSES.has(normalizedStatus)) {
    const error = new Error("Invalid judge result status.");
    error.statusCode = 400;
    throw error;
  }

  const passed = Number(passedTests);
  const total = Number(totalTests);
  if (!Number.isInteger(passed) || !Number.isInteger(total) || passed < 0 || total < 0 || passed > total || total > 100000) {
    const error = new Error("Invalid test result counts.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await DsaSubmission.findOneAndUpdate(
    { _id: submissionId, status: "Pending" },
    { $set: {
      status: normalizedStatus,
      passedTests: passed,
      totalTests: total,
      executionTimeMs: executionTimeMs == null ? null : Math.max(0, safeNumber(executionTimeMs) ?? 0),
      memoryUsedMb: memoryUsedMb == null ? null : Math.max(0, safeNumber(memoryUsedMb) ?? 0),
      judgeMessage: String(judgeMessage || "").slice(0, 5000),
    } },
    { returnDocument: "after" }
  ).lean();

  if (!updated) {
    const existing = await DsaSubmission.findById(submissionId).select("status").lean();
    if (!existing) {
      const error = new Error("Submission not found.");
      error.statusCode = 404;
      throw error;
    }
    return { submission: existing, duplicate: true };
  }

  const progress = await DsaProgress.findOne({ userId: updated.userId }).lean();
  const solvedIds = (progress?.solvedProblemIds || []).map(String);
  const attemptedIds = (progress?.attemptedProblemIds || []).map(String);
  const problemId = String(updated.problemId);
  const isNewAttempt = !attemptedIds.includes(problemId);
  const isNewSolve = normalizedStatus === "Accepted" && !solvedIds.includes(problemId);
  const completedAt = updated.updatedAt || new Date();

  const previousDay = progress?.lastPracticeDate ? startOfUtcDay(progress.lastPracticeDate) : null;
  const currentDay = startOfUtcDay(completedAt);
  let currentStreak = Number(progress?.currentStreak || 0);
  if (previousDay === null) currentStreak = 1;
  else if (previousDay === currentDay) currentStreak = Math.max(1, currentStreak);
  else if (currentDay - previousDay === 86400000) currentStreak += 1;
  else currentStreak = 1;

  const update = {
    $addToSet: { attemptedProblemIds: updated.problemId },
    $set: {
      totalAttempted: attemptedIds.length + (isNewAttempt ? 1 : 0),
      totalSolved: solvedIds.length + (isNewSolve ? 1 : 0),
      currentStreak,
      longestStreak: Math.max(Number(progress?.longestStreak || 0), currentStreak),
      lastPracticeDate: completedAt,
    },
    $setOnInsert: { userId: updated.userId },
  };

  if (isNewSolve) update.$addToSet.solvedProblemIds = updated.problemId;
  if (isNewAttempt || isNewSolve) update.$inc = { xp: normalizedStatus === "Accepted" && isNewSolve ? 10 : 2 };

  await DsaProgress.findOneAndUpdate({ userId: updated.userId }, update, { upsert: true, returnDocument: "after" });
  return { submission: updated, duplicate: false };
};
