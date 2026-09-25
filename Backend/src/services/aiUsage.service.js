import mongoose from "mongoose";
import AIUsageEvent from "../models/AIUsageEvent.js";

const DAY = 86400000;

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const resolveRange = ({ preset, from, to } = {}) => {
  const now = new Date();
  const customFrom = parseDate(from);
  const customTo = parseDate(to);

  if (customFrom && customTo && customFrom <= customTo) {
    const start = new Date(customFrom);
    const end = new Date(customTo);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end, days: Math.max(1, Math.ceil((end - start) / DAY)) };
  }

  const days = { "1d": 1, "7d": 7, "30d": 30, "90d": 90, "180d": 180 }[preset] || 30;
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end: now, days };
};

const toObjectId = (value) => {
  if (!value) return null;
  return mongoose.isValidObjectId(value) ? new mongoose.Types.ObjectId(value) : null;
};

const groupRows = (rows) => rows.map((row) => ({
  key: row._id,
  requests: row.requests || 0,
  successfulRequests: row.successfulRequests || 0,
  failedRequests: row.failedRequests || 0,
  inputTokens: row.inputTokens || 0,
  outputTokens: row.outputTokens || 0,
  totalTokens: row.totalTokens || 0,
}));

const rangeMatch = (start, end, extra = {}) => ({ createdAt: { $gte: start, $lte: end }, ...extra });

export const recordAIUsage = async ({
  userId = null,
  courseId = null,
  conversationId = null,
  feature = "chat",
  audience = userId ? "user" : "guest",
  provider = "nvidia",
  model = "",
  requestChars = 0,
  usage = null,
  latencyMs = 0,
  success = true,
  statusCode = null,
  errorCode = "",
}) => {
  try {
    const inputTokens = Number(usage?.prompt_tokens ?? usage?.input_tokens ?? 0) || 0;
    const outputTokens = Number(usage?.completion_tokens ?? usage?.output_tokens ?? 0) || 0;
    const totalTokens = Number(usage?.total_tokens ?? inputTokens + outputTokens) || 0;

    await AIUsageEvent.create({
      user: toObjectId(userId),
      course: toObjectId(courseId),
      conversation: toObjectId(conversationId),
      feature,
      audience,
      provider,
      model: String(model || "").slice(0, 200),
      requestChars: Math.max(0, Number(requestChars) || 0),
      inputTokens: Math.max(0, inputTokens),
      outputTokens: Math.max(0, outputTokens),
      totalTokens: Math.max(0, totalTokens),
      latencyMs: Math.max(0, Math.round(Number(latencyMs) || 0)),
      success: Boolean(success),
      statusCode: statusCode ? Number(statusCode) : null,
      errorCode: String(errorCode || "").slice(0, 100),
    });
  } catch {
    // Analytics must never break an AI request.
  }
};

const aggregate = async (start, end, match = {}) => {
  const rows = await AIUsageEvent.aggregate([
    { $match: rangeMatch(start, end, match) },
    {
      $group: {
        _id: null,
        requests: { $sum: 1 },
        successfulRequests: { $sum: { $cond: ["$success", 1, 0] } },
        failedRequests: { $sum: { $cond: ["$success", 0, 1] } },
        inputTokens: { $sum: "$inputTokens" },
        outputTokens: { $sum: "$outputTokens" },
        totalTokens: { $sum: "$totalTokens" },
        averageLatencyMs: { $avg: "$latencyMs" },
      },
    },
  ]);
  return {
    requests: rows[0]?.requests || 0,
    successfulRequests: rows[0]?.successfulRequests || 0,
    failedRequests: rows[0]?.failedRequests || 0,
    inputTokens: rows[0]?.inputTokens || 0,
    outputTokens: rows[0]?.outputTokens || 0,
    totalTokens: rows[0]?.totalTokens || 0,
    averageLatencyMs: Number((rows[0]?.averageLatencyMs || 0).toFixed(1)),
  };
};

export const getMyAIUsage = async ({ userId, preset = "30d" }) => {
  if (!mongoose.isValidObjectId(userId)) {
    const error = new Error("Authenticated user is required.");
    error.statusCode = 401;
    error.code = "AI_AUTHENTICATION_REQUIRED";
    throw error;
  }

  const { start, end, days } = resolveRange({ preset });
  const totals = await aggregate(start, end, { user: new mongoose.Types.ObjectId(userId) });

  const byFeature = await AIUsageEvent.aggregate([
    { $match: rangeMatch(start, end, { user: new mongoose.Types.ObjectId(userId) }) },
    {
      $group: {
        _id: "$feature",
        requests: { $sum: 1 },
        successfulRequests: { $sum: { $cond: ["$success", 1, 0] } },
        totalTokens: { $sum: "$totalTokens" },
      },
    },
    { $sort: { requests: -1 } },
  ]);

  return {
    range: { from: start.toISOString(), to: end.toISOString(), days },
    totals,
    byFeature: groupRows(byFeature),
  };
};

export const getAdminAIUsage = async ({ preset = "30d", from, to, courseId, feature }) => {
  const { start, end, days } = resolveRange({ preset, from, to });
  const match = {};
  if (courseId && mongoose.isValidObjectId(courseId)) match.course = new mongoose.Types.ObjectId(courseId);
  if (feature) match.feature = String(feature);

  const totals = await aggregate(start, end, match);

  const [byFeature, byCourse, byModel, daily, topUsers] = await Promise.all([
    AIUsageEvent.aggregate([
      { $match: rangeMatch(start, end, match) },
      { $group: { _id: "$feature", requests: { $sum: 1 }, successfulRequests: { $sum: { $cond: ["$success", 1, 0] } }, failedRequests: { $sum: { $cond: ["$success", 0, 1] } }, totalTokens: { $sum: "$totalTokens" }, averageLatencyMs: { $avg: "$latencyMs" } } },
      { $sort: { requests: -1 } },
    ]),
    AIUsageEvent.aggregate([
      { $match: rangeMatch(start, end, match) },
      { $group: { _id: "$course", requests: { $sum: 1 }, totalTokens: { $sum: "$totalTokens" } } },
      { $sort: { requests: -1 } },
      { $limit: 20 },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, courseId: "$_id", title: { $ifNull: ["$course.title", "Public / no course"] }, requests: 1, totalTokens: 1 } },
    ]),
    AIUsageEvent.aggregate([
      { $match: rangeMatch(start, end, match) },
      { $group: { _id: { provider: "$provider", model: "$model" }, requests: { $sum: 1 }, totalTokens: { $sum: "$totalTokens" } } },
      { $sort: { requests: -1 } },
    ]),
    AIUsageEvent.aggregate([
      { $match: rangeMatch(start, end, match) },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, requests: { $sum: 1 }, successfulRequests: { $sum: { $cond: ["$success", 1, 0] } }, totalTokens: { $sum: "$totalTokens" } } },
      { $sort: { _id: 1 } },
    ]),
    AIUsageEvent.aggregate([
      { $match: rangeMatch(start, end, { ...match, user: { $ne: null } }) },
      { $group: { _id: "$user", requests: { $sum: 1 }, totalTokens: { $sum: "$totalTokens" } } },
      { $sort: { requests: -1 } },
      { $limit: 20 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, userId: "$_id", name: "$user.name", email: "$user.email", requests: 1, totalTokens: 1 } },
    ]),
  ]);

  return {
    range: { from: start.toISOString(), to: end.toISOString(), days },
    totals,
    byFeature: groupRows(byFeature),
    byCourse,
    byModel: byModel.map((row) => ({ provider: row._id.provider, model: row._id.model, requests: row.requests, totalTokens: row.totalTokens })),
    daily,
    topUsers,
  };
};
