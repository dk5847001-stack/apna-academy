import User from "../models/User.js";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Notification from "../models/Notification.js";

const monthKey = (date) => {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
};

const buildMonths = (count = 6) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1 - index), 1));
    return { key: monthKey(date), label: date.toLocaleString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }) };
  });
};

export const getAdminAnalytics = async () => {
  const months = buildMonths(6);
  const firstMonth = new Date(`${months[0].key}-01T00:00:00.000Z`);
  const nextMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1));

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
    monthlyUsers,
    monthlyRevenue,
    topCourses,
    recentPurchases,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", status: "active" }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Purchase.countDocuments(),
    Purchase.countDocuments({ paymentStatus: "paid" }),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Certificate.countDocuments(),
    Progress.countDocuments({ isCompleted: true }),
    Notification.countDocuments({ user: null, isRead: false }),
    User.aggregate([
      { $match: { role: "user", createdAt: { $gte: firstMonth, $lt: nextMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid", purchasedAt: { $gte: firstMonth, $lt: nextMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$purchasedAt" } }, value: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]),
    Purchase.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: "$course", purchases: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $sort: { purchases: -1, revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, courseId: "$_id", title: { $ifNull: ["$course.title", "Unknown course"] }, purchases: 1, revenue: 1 } },
    ]),
    Purchase.find().populate("user", "name email").populate("course", "title").sort({ purchasedAt: -1, createdAt: -1 }).limit(6).lean(),
  ]);

  const userMap = new Map(monthlyUsers.map((item) => [item._id, item.value]));
  const revenueMap = new Map(monthlyRevenue.map((item) => [item._id, item.value]));

  return {
    overview: {
      totalStudents,
      activeStudents,
      totalCourses,
      publishedCourses,
      totalPurchases,
      paidPurchases,
      revenue: revenueResult[0]?.total || 0,
      certificatesIssued,
      completedProgress,
      unreadBroadcasts,
    },
    trends: months.map((month) => ({ ...month, users: userMap.get(month.key) || 0, revenue: revenueMap.get(month.key) || 0 })),
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
