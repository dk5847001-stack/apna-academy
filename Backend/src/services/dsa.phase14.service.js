import mongoose from "mongoose";
import DsaProblem from "../models/DsaProblem.js";
import DsaProgress from "../models/DsaProgress.js";
import DsaSubmission from "../models/DsaSubmission.js";

const clampInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const toObjectId = (value) => {
  if (!mongoose.isValidObjectId(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

export const getProgressDashboard = async (userId) => {
  const [progress, submissionStats, solvedBreakdown] = await Promise.all([
    DsaProgress.findOne({ userId }).lean(),
    DsaSubmission.aggregate([
      { $match: { userId: toObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]),
    (async () => {
      const current = await DsaProgress.findOne({ userId }).select("solvedProblemIds").lean();
      const solvedIds = current?.solvedProblemIds || [];
      if (!solvedIds.length) return { total: 0, difficulty: [], topics: [], companies: [] };

      const [difficulty, topics, companies] = await Promise.all([
        DsaProblem.aggregate([
          { $match: { _id: { $in: solvedIds }, status: "PUBLISHED" } },
          { $group: { _id: "$difficulty", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, name: "$_id", count: 1 } },
        ]),
        DsaProblem.aggregate([
          { $match: { _id: { $in: solvedIds }, status: "PUBLISHED" } },
          { $unwind: "$topics" },
          { $group: { _id: "$topics", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 20 },
          { $project: { _id: 0, name: "$_id", count: 1 } },
        ]),
        DsaProblem.aggregate([
          { $match: { _id: { $in: solvedIds }, status: "PUBLISHED" } },
          { $unwind: "$companies" },
          { $group: { _id: "$companies", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $limit: 20 },
          { $project: { _id: 0, name: "$_id", count: 1 } },
        ]),
      ]);

      return { total: solvedIds.length, difficulty, topics, companies };
    })(),
  ]);

  const totalAttempted = progress?.totalAttempted || 0;
  const totalSolved = progress?.totalSolved || 0;
  const accuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;

  return {
    totalSolved,
    totalAttempted,
    remaining: Math.max(0, await DsaProblem.countDocuments({ status: "PUBLISHED" }) - totalSolved),
    currentStreak: progress?.currentStreak || 0,
    longestStreak: progress?.longestStreak || 0,
    lastPracticeDate: progress?.lastPracticeDate || null,
    xp: progress?.xp || 0,
    accuracy,
    submissionStats: submissionStats.map((item) => ({ status: item._id, count: item.count })),
    solvedBreakdown,
  };
};

export const listSubmissionHistory = async (userId, { page = 1, limit = 20, status, problemId } = {}) => {
  const safePage = clampInt(page, 1, 100000);
  const safeLimit = clampInt(limit, 20, 50);
  const filter = { userId };

  if (status) filter.status = status;
  if (problemId) {
    const objectId = toObjectId(problemId);
    if (!objectId) return { items: [], pagination: { page: safePage, limit: safeLimit, total: 0, pages: 0 } };
    filter.problemId = objectId;
  }

  const skip = (safePage - 1) * safeLimit;
  const [items, total] = await Promise.all([
    DsaSubmission.find(filter)
      .populate("problemId", "slug title difficulty")
      .select("problemId language status passedTests totalTests executionTimeMs memoryUsedMb judgeMessage createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    DsaSubmission.countDocuments(filter),
  ]);

  return {
    items,
    pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
  };
};
