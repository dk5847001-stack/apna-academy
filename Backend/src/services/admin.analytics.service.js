import User from "../models/User.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Notification from "../models/Notification.js";

const DAY = 86400000;
const pad = (value) => String(value).padStart(2, "0");
const monthKey = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
const dayKey = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

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
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(customTo);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end, days: Math.max(1, Math.ceil((end - start) / DAY)) };
  }

  const days = { "7d": 7, "30d": 30, "90d": 90, "180d": 180, "1y": 365 }[preset] || 180;
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end: now, days };
};

const getPreviousRange = ({ start, end, days }) => {
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - ((days - 1) * DAY));
  previousStart.setUTCHours(0, 0, 0, 0);
  return { start: previousStart, end: previousEnd };
};

const buildBuckets = (start, end, days) => {
  const daily = days <= 31;
  const buckets = [];

  if (daily) {
    const cursor = new Date(start);
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor <= end) {
      buckets.push({
        key: dayKey(cursor),
        label: cursor.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" }),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return { buckets, format: "%Y-%m-%d" };
  }

  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cursor <= last) {
    buckets.push({
      key: monthKey(cursor),
      label: cursor.toLocaleString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return { buckets, format: "%Y-%m" };
};

const percentChange = (current, previous) => {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const toStatusBreakdown = (rows) => {
  const result = { paid: 0, pending: 0, failed: 0, refunded: 0 };
  rows.forEach((row) => {
    if (Object.prototype.hasOwnProperty.call(result, row._id)) result[row._id] = row.count;
  });
  return result;
};

export const getAdminAnalytics = async (filters = {}) => {
  const { start, end, days } = resolveRange(filters);
  const previous = getPreviousRange({ start, end, days });
  const { buckets, format } = buildBuckets(start, end, days);
  const range = { $gte: start, $lte: end };
  const previousRange = { $gte: previous.start, $lte: previous.end };
  const groupDate = (field) => ({ $dateToString: { format, date: field } });

  const [
    totalStudents,
    activeStudents,
    totalCourses,
    publishedCourses,
    totalPurchases,
    paidPurchases,
    revenueResult,
    certificatesIssued,
    completedProgress,
    unreadBroadcasts,
    bucketUsers,
    bucketRevenue,
    bucketPurchases,
    topCourses,
    recentPurchases,
    purchaseStatuses,
    uniquePurchasers,
    uniquePreviousPurchasers,
    periodRegistrations,
    previousRegistrations,
    periodCompletions,
    previousCompletions,
    coursePerformance,
    previousRevenueResult,
    previousPaidPurchases,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", status: "active" }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Purchase.countDocuments({ purchasedAt: range }),
    Purchase.countDocuments({ paymentStatus: "paid", purchasedAt: range }),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid", purchasedAt: range } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Certificate.countDocuments({ createdAt: range }),
    Progress.countDocuments({ isCompleted: true, updatedAt: range }),
    Notification.countDocuments({ user: null, isRead: false }),
    User.aggregate([
      { $match: { role: "user", createdAt: range } },
      { $group: { _id: groupDate("$createdAt"), value: { $sum: 1 } } },
    ]),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid", purchasedAt: range } },
      { $group: { _id: groupDate("$purchasedAt"), value: { $sum: "$amount" } } },
    ]),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid", purchasedAt: range } },
      { $group: { _id: groupDate("$purchasedAt"), value: { $sum: 1 } } },
    ]),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid", purchasedAt: range } },
      { $group: { _id: "$course", purchases: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $sort: { purchases: -1, revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, courseId: "$_id", title: { $ifNull: ["$course.title", "Unknown course"] }, purchases: 1, revenue: 1 } },
    ]),
    Purchase.find({ purchasedAt: range })
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ purchasedAt: -1, createdAt: -1 })
      .limit(8)
      .lean(),
    Purchase.aggregate([
      { $match: { purchasedAt: range } },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]),
    Purchase.distinct("user", { paymentStatus: "paid", purchasedAt: range }),
    Purchase.distinct("user", { paymentStatus: "paid", purchasedAt: previousRange }),
    User.countDocuments({ role: "user", createdAt: range }),
    User.countDocuments({ role: "user", createdAt: previousRange }),
    Progress.countDocuments({ isCompleted: true, updatedAt: range }),
    Progress.countDocuments({ isCompleted: true, updatedAt: previousRange }),
    Progress.aggregate([
      { $match: { updatedAt: range } },
      { $group: {
        _id: "$course",
        learners: { $sum: 1 },
        averageProgress: { $avg: "$overallProgress" },
        completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
      } },
      { $sort: { learners: -1, completed: -1, averageProgress: -1 } },
      { $limit: 8 },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $project: {
        _id: 0,
        courseId: "$_id",
        title: { $ifNull: ["$course.title", "Unknown course"] },
        learners: 1,
        averageProgress: { $round: ["$averageProgress", 1] },
        completed: 1,
        completionRate: {
          $cond: [
            { $gt: ["$learners", 0] },
            { $round: [{ $multiply: [{ $divide: ["$completed", "$learners"] }, 100] }, 1] },
            0,
          ],
        },
      } },
    ]),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid", purchasedAt: previousRange } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Purchase.countDocuments({ paymentStatus: "paid", purchasedAt: previousRange }),
  ]);

  const userMap = new Map(bucketUsers.map((item) => [item._id, item.value]));
  const revenueMap = new Map(bucketRevenue.map((item) => [item._id, item.value]));
  const purchaseMap = new Map(bucketPurchases.map((item) => [item._id, item.value]));

  const revenue = revenueResult[0]?.total || 0;
  const previousRevenue = previousRevenueResult[0]?.total || 0;
  const paidConversion = periodRegistrations ? (uniquePurchasers.length / periodRegistrations) * 100 : 0;
  const completionConversion = uniquePurchasers.length ? (periodCompletions / uniquePurchasers.length) * 100 : 0;

  return {
    range: {
      from: start.toISOString(),
      to: end.toISOString(),
      previousFrom: previous.start.toISOString(),
      previousTo: previous.end.toISOString(),
      days,
      granularity: days <= 31 ? "day" : "month",
    },
    overview: {
      totalStudents,
      activeStudents,
      totalCourses,
      publishedCourses,
      totalPurchases,
      paidPurchases,
      revenue,
      certificatesIssued,
      completedProgress,
      unreadBroadcasts,
    },
    trends: buckets.map((bucket) => ({
      ...bucket,
      users: userMap.get(bucket.key) || 0,
      revenue: revenueMap.get(bucket.key) || 0,
      purchases: purchaseMap.get(bucket.key) || 0,
    })),
    advanced: {
      purchaseStatus: toStatusBreakdown(purchaseStatuses),
      conversion: {
        registeredStudents: periodRegistrations,
        uniquePurchasers: uniquePurchasers.length,
        registeredToPaidPercent: Number(paidConversion.toFixed(1)),
        completedCourses: periodCompletions,
        paidToCompletedPercent: Number(completionConversion.toFixed(1)),
      },
      coursePerformance: coursePerformance.map((course) => ({
        ...course,
        averageProgress: Number(course.averageProgress || 0),
        completionRate: Number(course.completionRate || 0),
      })),
      comparison: {
        revenue: percentChange(revenue, previousRevenue),
        paidPurchases: percentChange(paidPurchases, previousPaidPurchases),
        registrations: percentChange(periodRegistrations, previousRegistrations),
        completions: percentChange(periodCompletions, previousCompletions),
      },
      previous: {
        revenue: previousRevenue,
        paidPurchases: previousPaidPurchases,
        registrations: previousRegistrations,
        completions: previousCompletions,
        uniquePurchasers: uniquePreviousPurchasers.length,
      },
    },
    topCourses,
    recentPurchases: recentPurchases.map((purchase) => ({
      id: purchase._id.toString(),
      amount: purchase.amount,
      currency: purchase.currency,
      status: purchase.paymentStatus,
      purchasedAt: purchase.purchasedAt,
      user: purchase.user ? { name: purchase.user.name, email: purchase.user.email } : null,
      course: purchase.course ? { title: purchase.course.title } : null,
    })),
  };
};
