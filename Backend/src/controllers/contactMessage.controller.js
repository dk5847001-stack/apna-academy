import ContactMessage from "../models/ContactMessage.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const clean = (value) => String(value ?? "").trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateContact = ({ name, email, subject, message }) => {
  const errors = {};
  if (name.length < 2 || name.length > 100) errors.name = "Name must be between 2 and 100 characters.";
  if (!emailPattern.test(email) || email.length > 254) errors.email = "Please provide a valid email address.";
  if (subject.length < 3 || subject.length > 200) errors.subject = "Subject must be between 3 and 200 characters.";
  if (message.length < 10 || message.length > 5000) errors.message = "Message must be between 10 and 5000 characters.";
  return errors;
};

export const createContactMessage = asyncHandler(async (req, res) => {
  const payload = {
    name: clean(req.body?.name),
    email: clean(req.body?.email).toLowerCase(),
    subject: clean(req.body?.subject),
    message: clean(req.body?.message),
  };
  const errors = validateContact(payload);
  if (Object.keys(errors).length) return res.status(400).json({ success: false, message: "Please correct the highlighted fields.", errors });

  const created = await ContactMessage.create(payload);
  const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
  if (admins.length) {
    await Notification.insertMany(admins.map((admin) => ({
      user: admin._id,
      title: `New contact message: ${payload.subject}`,
      message: `${payload.name} (${payload.email}) sent a new website message.`,
      type: "system",
      link: "/admin/messages",
    })));
  }

  return successResponse({ res, statusCode: 201, message: "Your message has been sent successfully.", data: { id: created._id.toString() } });
});

export const listAdminMessages = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query?.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query?.limit) || 20, 1), 100);
  const status = ["new", "read", "replied", "closed"].includes(req.query?.status) ? req.query.status : "";
  const search = clean(req.query?.search);
  const query = {};
  if (status) query.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { subject: { $regex: escaped, $options: "i" } },
      { message: { $regex: escaped, $options: "i" } },
    ];
  }
  const [messages, total, newCount, repliedCount] = await Promise.all([
    ContactMessage.find(query).populate("repliedBy", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ContactMessage.countDocuments(query),
    ContactMessage.countDocuments({ ...query, status: "new" }),
    ContactMessage.countDocuments({ ...query, status: "replied" }),
  ]);
  return successResponse({ res, message: "Contact messages loaded successfully.", data: {
    messages: messages.map((item) => ({ ...item, id: item._id.toString(), _id: undefined })),
    summary: { total, new: newCount, replied: repliedCount },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }});
});

export const getAdminMessage = asyncHandler(async (req, res) => {
  const item = await ContactMessage.findById(req.params.messageId).populate("repliedBy", "name email").lean();
  if (!item) return res.status(404).json({ success: false, message: "Contact message not found." });
  if (item.status === "new") await ContactMessage.updateOne({ _id: item._id }, { $set: { status: "read" } });
  return successResponse({ res, message: "Contact message loaded successfully.", data: { ...item, id: item._id.toString(), _id: undefined } });
});

export const updateAdminMessage = asyncHandler(async (req, res) => {
  const item = await ContactMessage.findById(req.params.messageId);
  if (!item) return res.status(404).json({ success: false, message: "Contact message not found." });
  const status = req.body?.status;
  const reply = clean(req.body?.adminReply);
  const updates = {};
  if (status !== undefined) {
    if (!["new", "read", "replied", "closed"].includes(status)) return res.status(400).json({ success: false, message: "Invalid message status." });
    updates.status = status;
  }
  if (reply) {
    if (reply.length > 5000) return res.status(400).json({ success: false, message: "Reply cannot exceed 5000 characters." });
    updates.adminReply = reply;
    updates.repliedAt = new Date();
    updates.repliedBy = req.user?.userId;
    updates.status = "replied";
  }
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "No changes supplied." });
  await ContactMessage.updateOne({ _id: item._id }, { $set: updates });
  const updated = await ContactMessage.findById(item._id).populate("repliedBy", "name email").lean();
  return successResponse({ res, message: reply ? "Reply saved successfully." : "Message updated successfully.", data: { ...updated, id: updated._id.toString(), _id: undefined } });
});
