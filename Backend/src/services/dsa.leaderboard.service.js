import User from "../models/User.js";
import DsaProgress from "../models/DsaProgress.js";

const clampInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

export const getDsaLeaderboard = async (userId, { page = 1, limit = 50 } = {}) => {
  const safePage = clampInt(page, 1, 20);
  const safeLimit = clampInt(limit, 50, 100);
  const skip = (safePage - 1) * safeLimit;

  const [rows, currentProgress] = await Promise.all([
    DsaProgress.aggregate([
      { $match: { totalSolved: { $gt: 0 } } },
      { $lookup: { from: User.collection.name, localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $match: { "user.status": "active", "user.role": "user" } },
      { $sort: { totalSolved: -1, xp: -1, longestStreak: -1, updatedAt: 1, _id: 1 } },
      { $skip: skip },
      { $limit: safeLimit },
      { $project: {
        userId: 1, name: "$user.name", avatar: "$user.avatar",
        totalSolved: 1, totalAttempted: 1, xp: 1, currentStreak: 1, longestStreak: 1,
      } },
    ]),
    DsaProgress.findOne({ userId }).select("totalSolved totalAttempted xp currentStreak longestStreak").lean(),
  ]);

  const participantRows = await DsaProgress.aggregate([
    { $match: { totalSolved: { $gt: 0 } } },
    { $lookup: { from: User.collection.name, localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $match: { "user.status": "active", "user.role": "user" } },
    { $count: "total" },
  ]);
  const participantCount = participantRows[0]?.total || 0;

  const items = rows.map((item, index) => ({
    rank: skip + index + 1,
    userId: String(item.userId),
    name: item.name,
    avatar: item.avatar || "",
    totalSolved: item.totalSolved || 0,
    totalAttempted: item.totalAttempted || 0,
    xp: item.xp || 0,
    currentStreak: item.currentStreak || 0,
    longestStreak: item.longestStreak || 0,
  }));

  let myRank = null;
  if (currentProgress?.totalSolved > 0) {
    const [aheadBySolved, aheadByXp] = await Promise.all([
      DsaProgress.countDocuments({ totalSolved: { $gt: currentProgress.totalSolved } }),
      DsaProgress.countDocuments({ totalSolved: currentProgress.totalSolved, xp: { $gt: currentProgress.xp || 0 } }),
    ]);
    myRank = aheadBySolved + aheadByXp + 1;
  }

  return {
    items,
    pagination: { page: safePage, limit: safeLimit, total: participantCount, pages: Math.ceil(participantCount / safeLimit) },
    me: currentProgress ? {
      rank: myRank,
      totalSolved: currentProgress.totalSolved || 0,
      totalAttempted: currentProgress.totalAttempted || 0,
      xp: currentProgress.xp || 0,
      currentStreak: currentProgress.currentStreak || 0,
      longestStreak: currentProgress.longestStreak || 0,
    } : null,
    participantCount,
  };
};
