import { getProgressDashboard, listSubmissionHistory } from "../services/dsa.phase14.service.js";

const positiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const allowedStatuses = new Set([
  "Pending",
  "Accepted",
  "Wrong Answer",
  "Compilation Error",
  "Runtime Error",
  "TLE",
  "MLE",
  "Runtime Limit",
  "Internal Error",
]);

export const getDsaProgressDashboard = async (req, res, next) => {
  try {
    const data = await getProgressDashboard(req.user.userId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getDsaSubmissionHistory = async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status.trim() : undefined;
    if (status && !allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, message: "Invalid submission status." });
    }

    const data = await listSubmissionHistory(req.user.userId, {
      page: positiveInt(req.query.page, 1, 100000),
      limit: positiveInt(req.query.limit, 20, 50),
      status,
      problemId: typeof req.query.problemId === "string" ? req.query.problemId.trim() : undefined,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
