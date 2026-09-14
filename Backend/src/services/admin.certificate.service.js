import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatCertificate = (item) => ({
  id: item._id?.toString(),
  certificateId: item.certificateId,
  recipientName: item.recipientName,
  issueDate: item.issueDate,
  certificateUrl: item.certificateUrl || "",
  verificationUrl: item.verificationUrl || "",
  qrCodeUrl: item.qrCodeUrl || "",
  isValid: Boolean(item.isValid),
  user: item.user ? { id: item.user._id?.toString(), name: item.user.name, email: item.user.email, avatar: item.user.avatar || "" } : null,
  course: item.course ? { id: item.course._id?.toString(), title: item.course.title, slug: item.course.slug, thumbnail: item.course.thumbnail || "" } : null,
});

export const listAdminCertificates = async ({ page = 1, limit = 20, search = "", courseId = "", validity = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};

  if (isObjectId(courseId)) query.course = courseId;
  if (validity === "valid") query.isValid = true;
  if (validity === "invalid") query.isValid = false;

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const [userIds, courseIds] = await Promise.all([
      User.find({ $or: [{ name: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }] }).distinct("_id"),
      Course.find({ title: { $regex: escaped, $options: "i" } }).distinct("_id"),
    ]);
    query.$or = [
      { certificateId: { $regex: escaped, $options: "i" } },
      { recipientName: { $regex: escaped, $options: "i" } },
      { user: { $in: userIds } },
      { course: { $in: courseIds } },
    ];
  }

  const skip = (safePage - 1) * safeLimit;
  const [rows, total] = await Promise.all([
    Certificate.find(query)
      .populate({ path: "user", select: "name email avatar" })
      .populate({ path: "course", select: "title slug thumbnail" })
      .sort({ issueDate: -1 }).skip(skip).limit(safeLimit).lean(),
    Certificate.countDocuments(query),
  ]);

  return { certificates: rows.map(formatCertificate), pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
};

export const getAdminCertificate = async (certificateId) => {
  if (!isObjectId(certificateId)) { const error = new Error("Invalid certificate id."); error.statusCode = 400; throw error; }
  const certificate = await Certificate.findById(certificateId)
    .populate({ path: "user", select: "name email avatar role status isEmailVerified" })
    .populate({ path: "course", select: "title slug thumbnail totalVideos totalModules" })
    .lean();
  if (!certificate) { const error = new Error("Certificate not found."); error.statusCode = 404; throw error; }
  return formatCertificate(certificate);
};

export const updateAdminCertificate = async ({ certificateId, isValid }) => {
  if (!isObjectId(certificateId)) { const error = new Error("Invalid certificate id."); error.statusCode = 400; throw error; }
  if (typeof isValid !== "boolean") { const error = new Error("isValid must be a boolean."); error.statusCode = 400; throw error; }
  const certificate = await Certificate.findByIdAndUpdate(certificateId, { $set: { isValid } }, { new: true })
    .populate({ path: "user", select: "name email avatar" })
    .populate({ path: "course", select: "title slug thumbnail" })
    .lean();
  if (!certificate) { const error = new Error("Certificate not found."); error.statusCode = 404; throw error; }
  return formatCertificate(certificate);
};
