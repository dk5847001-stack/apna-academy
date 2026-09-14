import mongoose from "mongoose";
import User from "../models/User.js";

const ALLOWED_ROLES = new Set(["user", "admin"]);
const ALLOWED_STATUSES = new Set(["active", "inactive", "suspended"]);

const sanitizeUser = (user) => ({
  id: user._id?.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
  phone: user.phone || "",
  isEmailVerified: Boolean(user.isEmailVerified),
  status: user.status,
  lastLoginAt: user.lastLoginAt || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const assertObjectId = (id, message = "Invalid user id.") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

export const listAdminUsers = async ({ page = 1, limit = 20, search = "", role = "", status = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { phone: { $regex: escaped, $options: "i" } },
    ];
  }

  if (role && ALLOWED_ROLES.has(role)) query.role = role;
  if (status && ALLOWED_STATUSES.has(status)) query.status = status;

  const skip = (safePage - 1) * safeLimit;
  const [users, total] = await Promise.all([
    User.find(query)
      .select("name email role avatar phone isEmailVerified status lastLoginAt createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users: users.map(sanitizeUser),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getAdminUser = async (userId) => {
  assertObjectId(userId);
  const user = await User.findById(userId)
    .select("name email role avatar phone isEmailVerified status lastLoginAt createdAt updatedAt")
    .lean();

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

export const updateAdminUser = async ({ userId, actorId, role, status }) => {
  assertObjectId(userId);
  assertObjectId(actorId);

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (role !== undefined && !ALLOWED_ROLES.has(role)) {
    const error = new Error("Invalid role.");
    error.statusCode = 400;
    throw error;
  }

  if (status !== undefined && !ALLOWED_STATUSES.has(status)) {
    const error = new Error("Invalid account status.");
    error.statusCode = 400;
    throw error;
  }

  const isSelf = user._id.toString() === actorId.toString();
  if (isSelf && role !== undefined && role !== "admin") {
    const error = new Error("You cannot remove your own admin role.");
    error.statusCode = 400;
    throw error;
  }

  if (isSelf && status !== undefined && status !== "active") {
    const error = new Error("You cannot deactivate your own admin account.");
    error.statusCode = 400;
    throw error;
  }

  if (user.role === "admin" && role === "user") {
    const activeAdminCount = await User.countDocuments({ role: "admin", status: "active" });
    if (activeAdminCount <= 1) {
      const error = new Error("At least one active admin account must remain.");
      error.statusCode = 400;
      throw error;
    }
  }

  if (user.role === "admin" && status !== undefined && status !== "active") {
    const activeAdminCount = await User.countDocuments({ role: "admin", status: "active" });
    if (activeAdminCount <= 1) {
      const error = new Error("At least one active admin account must remain.");
      error.statusCode = 400;
      throw error;
    }
  }

  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;
  await user.save();

  return sanitizeUser(user.toObject());
};
