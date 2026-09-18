import mongoose from "mongoose";
import PromoCode from "../models/PromoCode.js";
import PromoRedemption from "../models/PromoRedemption.js";
import PromoReservation from "../models/PromoReservation.js";
import PromoAuditEvent from "../models/PromoAuditEvent.js";

const assertObjectId = (id, message = "Invalid promo code id.") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(message); error.statusCode = 400; throw error;
  }
};
const normalizeCode = (value) => String(value || "").trim().toUpperCase();
const normalizeCategories = (values) => [...new Set((Array.isArray(values) ? values : []).map((v) => String(v).trim().toLowerCase()).filter(Boolean))];

const sanitize = (promo) => ({
  id: promo._id?.toString(), code: promo.code, description: promo.description || "",
  discountType: promo.discountType, discountValue: promo.discountValue,
  maxDiscountAmount: promo.maxDiscountAmount ?? null, minPurchaseAmount: promo.minPurchaseAmount ?? 0,
  applicableCourses: (promo.applicableCourses || []).map((id) => id?.toString?.() || id),
  applicableCategories: promo.applicableCategories || [], startsAt: promo.startsAt,
  expiresAt: promo.expiresAt || null, isActive: Boolean(promo.isActive),
  usageLimit: promo.usageLimit ?? null, perUserLimit: promo.perUserLimit ?? 1,
  usedCount: promo.usedCount || 0, reservedCount: promo.reservedCount || 0,
  remainingCount: promo.usageLimit == null ? null : Math.max(0, Number(promo.usageLimit) - Number(promo.usedCount || 0) - Number(promo.reservedCount || 0)),
  createdBy: promo.createdBy?.toString?.() || promo.createdBy || null, updatedBy: promo.updatedBy?.toString?.() || promo.updatedBy || null,
  createdAt: promo.createdAt, updatedAt: promo.updatedAt,
});

const buildPayload = (body = {}, existing = null) => {
  const code = normalizeCode(body.code ?? existing?.code);
  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(code)) { const e = new Error("Promo code must be 3-50 characters and contain only letters, numbers, hyphens or underscores."); e.statusCode = 400; throw e; }
  const discountType = body.discountType ?? existing?.discountType;
  if (!["percentage", "fixed"].includes(discountType)) { const e = new Error("Invalid discount type."); e.statusCode = 400; throw e; }
  const discountValue = Number(body.discountValue ?? existing?.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === "percentage" && discountValue > 100)) { const e = new Error("Invalid discount value."); e.statusCode = 400; throw e; }
  const capRaw = body.maxDiscountAmount ?? existing?.maxDiscountAmount ?? null;
  const maxDiscountAmount = capRaw === "" || capRaw == null ? null : Number(capRaw);
  if (maxDiscountAmount !== null && (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0 || discountType !== "percentage")) { const e = new Error("Maximum discount is only valid as a positive amount for percentage promos."); e.statusCode = 400; throw e; }
  const minPurchaseAmount = Number(body.minPurchaseAmount ?? existing?.minPurchaseAmount ?? 0);
  if (!Number.isFinite(minPurchaseAmount) || minPurchaseAmount < 0) { const e = new Error("Invalid minimum purchase amount."); e.statusCode = 400; throw e; }
  const limitRaw = body.usageLimit ?? existing?.usageLimit ?? null;
  const usageLimit = limitRaw === "" || limitRaw == null ? null : Number(limitRaw);
  if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) { const e = new Error("Usage limit must be a positive whole number or unlimited."); e.statusCode = 400; throw e; }
  const perUserLimit = Number(body.perUserLimit ?? existing?.perUserLimit ?? 1);
  if (!Number.isInteger(perUserLimit) || perUserLimit < 1) { const e = new Error("Per-user limit must be a positive whole number."); e.statusCode = 400; throw e; }
  const startsAt = new Date(body.startsAt ?? existing?.startsAt ?? Date.now());
  if (Number.isNaN(startsAt.getTime())) { const e = new Error("Invalid start date."); e.statusCode = 400; throw e; }
  const expiresRaw = body.expiresAt ?? existing?.expiresAt ?? null;
  const expiresAt = expiresRaw ? new Date(expiresRaw) : null;
  if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt <= startsAt)) { const e = new Error("Expiry must be later than the start date."); e.statusCode = 400; throw e; }
  const applicableCourses = Array.isArray(body.applicableCourses) ? body.applicableCourses : (existing?.applicableCourses || []);
  if (applicableCourses.some((id) => !mongoose.Types.ObjectId.isValid(id))) { const e = new Error("One or more applicable course IDs are invalid."); e.statusCode = 400; throw e; }
  return { code, description: String(body.description ?? existing?.description ?? "").trim().slice(0, 500), discountType, discountValue, maxDiscountAmount, minPurchaseAmount, applicableCourses, applicableCategories: normalizeCategories(body.applicableCategories ?? existing?.applicableCategories), startsAt, expiresAt, isActive: body.isActive === undefined ? Boolean(existing?.isActive ?? true) : Boolean(body.isActive), usageLimit, perUserLimit };
};

export const listAdminPromoCodes = async ({ page = 1, limit = 20, search = "", active = "" } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1), safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const query = {};
  if (search?.trim()) query.code = { $regex: search.trim().replace(/[.*+?^$()|[\]\\]/g, "\\$&"), $options: "i" };
  if (active === "true" || active === "false") query.isActive = active === "true";
  const [promos, total] = await Promise.all([PromoCode.find(query).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(), PromoCode.countDocuments(query)]);
  return { promos: promos.map(sanitize), pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.max(1, Math.ceil(total / safeLimit)) } };
};

export const getAdminPromoCode = async (promoId) => {
  assertObjectId(promoId);
  const promo = await PromoCode.findById(promoId).lean();
  if (!promo) { const e = new Error("Promo code not found."); e.statusCode = 404; throw e; }
  const [redemptions, reservations] = await Promise.all([
    PromoRedemption.find({ promoCode: promoId }).sort({ redeemedAt: -1 }).limit(50).populate("user", "name email").populate("course", "title slug").lean(),
    PromoReservation.find({ promoCode: promoId, status: "reserved" }).sort({ expiresAt: 1 }).limit(50).populate("user", "name email").populate("course", "title slug").lean(),
  ]);
  return {
    promo: sanitize(promo),
    redemptions: redemptions.map((x) => ({ id: x._id.toString(), code: x.codeSnapshot, discountAmount: x.discountAmount, orderAmount: x.orderAmount, finalAmount: x.finalAmount, redeemedAt: x.redeemedAt, razorpayOrderId: x.razorpayOrderId, razorpayPaymentId: x.razorpayPaymentId, user: x.user ? { id: x.user._id.toString(), name: x.user.name, email: x.user.email } : null, course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug } : null })),
    reservations: reservations.map((x) => ({ id: x._id.toString(), expiresAt: x.expiresAt, finalAmount: x.finalAmount, user: x.user ? { id: x.user._id.toString(), name: x.user.name, email: x.user.email } : null, course: x.course ? { id: x.course._id.toString(), title: x.course.title, slug: x.course.slug } : null })),
  };
};

export const createAdminPromoCode = async ({ actorId, payload }) => {
  assertObjectId(actorId, "Invalid administrator id.");
  const data = buildPayload(payload);
  if (await PromoCode.exists({ code: data.code })) { const e = new Error("A promo code with this code already exists."); e.statusCode = 409; throw e; }
  const created = await PromoCode.create({ ...data, createdBy: actorId, updatedBy: actorId });
  await audit({ promoCode: created._id, actor: actorId, action: "created", codeSnapshot: created.code, changes: data });
  return sanitize(created.toObject());
};

export const updateAdminPromoCode = async ({ promoId, actorId, payload }) => {
  assertObjectId(promoId); assertObjectId(actorId, "Invalid administrator id.");
  const promo = await PromoCode.findById(promoId);
  if (!promo) { const e = new Error("Promo code not found."); e.statusCode = 404; throw e; }
  const data = buildPayload(payload, promo);
  if (data.code !== promo.code && (promo.usedCount > 0 || promo.reservedCount > 0)) { const e = new Error("A promo code cannot be renamed after it has been used or reserved."); e.statusCode = 409; throw e; }
  if (data.usageLimit !== null && data.usageLimit < promo.usedCount + promo.reservedCount) { const e = new Error("Usage limit cannot be lower than current used and reserved usage."); e.statusCode = 400; throw e; }
  if (await PromoCode.exists({ code: data.code, _id: { $ne: promoId } })) { const e = new Error("A promo code with this code already exists."); e.statusCode = 409; throw e; }
  const before = { code: promo.code, discountType: promo.discountType, discountValue: promo.discountValue, maxDiscountAmount: promo.maxDiscountAmount, minPurchaseAmount: promo.minPurchaseAmount, usageLimit: promo.usageLimit, perUserLimit: promo.perUserLimit, startsAt: promo.startsAt, expiresAt: promo.expiresAt, isActive: promo.isActive };
  Object.assign(promo, data); promo.updatedBy = actorId; await promo.save();
  await audit({ promoCode: promo._id, actor: actorId, action: "updated", codeSnapshot: promo.code, changes: { before, after: data } });
  return sanitize(promo.toObject());
};

export const toggleAdminPromoCode = async ({ promoId, actorId, isActive }) => {
  assertObjectId(promoId); assertObjectId(actorId, "Invalid administrator id.");
  const promo = await PromoCode.findById(promoId);
  if (!promo) { const e = new Error("Promo code not found."); e.statusCode = 404; throw e; }
  const next = Boolean(isActive); const previous = Boolean(promo.isActive); promo.isActive = next; promo.updatedBy = actorId; await promo.save();
  if (previous !== next) await audit({ promoCode: promo._id, actor: actorId, action: next ? "activated" : "deactivated", codeSnapshot: promo.code, changes: { from: previous, to: next } });
  return sanitize(promo.toObject());
};

export const deleteAdminPromoCode = async ({ promoId, actorId }) => {
  assertObjectId(promoId);
  assertObjectId(actorId, "Invalid administrator id.");
  const promo = await PromoCode.findById(promoId);
  if (!promo) { const e = new Error("Promo code not found."); e.statusCode = 404; throw e; }
  if (promo.usedCount > 0 || promo.reservedCount > 0) { const e = new Error("Used or reserved promo codes cannot be deleted. Deactivate them instead."); e.statusCode = 409; throw e; }
  await PromoCode.deleteOne({ _id: promoId });
  await audit({ promoCode: null, actor: actorId, action: "deleted", codeSnapshot: promo.code, changes: { deletedPromoId: promoId } });
  return { id: promoId, deleted: true };
};

const audit = async ({ promoCode = null, actor, action, codeSnapshot, changes = null }) => {
  await PromoAuditEvent.create({ promoCode, actor, action, codeSnapshot, changes });
};

export const getAdminPromoAnalytics = async ({ from, to } = {}) => {
  const now = new Date();
  const end = to ? new Date(to) : now;
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    const e = new Error("Invalid analytics date range."); e.statusCode = 400; throw e;
  }
  const [totals, active, redemptionAgg, topCodes, currentReservations, auditCounts] = await Promise.all([
    PromoCode.countDocuments(),
    PromoCode.countDocuments({ isActive: true }),
    PromoRedemption.aggregate([
      { $match: { redeemedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, redemptions: { $sum: 1 }, discountAmount: { $sum: "$discountAmount" }, orderAmount: { $sum: "$orderAmount" }, finalAmount: { $sum: "$finalAmount" }, uniqueUsers: { $addToSet: "$user" }, uniquePromos: { $addToSet: "$promoCode" } } },
      { $project: { _id: 0, redemptions: 1, discountAmount: 1, orderAmount: 1, finalAmount: 1, uniqueUsers: { $size: "$uniqueUsers" }, uniquePromos: { $size: "$uniquePromos" } } },
    ]),
    PromoRedemption.aggregate([
      { $match: { redeemedAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$promoCode", redemptions: { $sum: 1 }, discountAmount: { $sum: "$discountAmount" }, finalAmount: { $sum: "$finalAmount" }, orderAmount: { $sum: "$orderAmount" } } },
      { $sort: { redemptions: -1, discountAmount: -1 } }, { $limit: 10 },
      { $lookup: { from: "promocodes", localField: "_id", foreignField: "_id", as: "promo" } },
      { $unwind: { path: "$promo", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, promoCodeId: "$_id", code: { $ifNull: ["$promo.code", "Deleted promo"] }, redemptions: 1, discountAmount: 1, finalAmount: 1, orderAmount: 1 } },
    ]),
    PromoReservation.countDocuments({ status: "reserved" }),
    PromoAuditEvent.aggregate([{ $match: { createdAt: { $gte: start, $lte: end } } }, { $group: { _id: "$action", count: { $sum: 1 } } }]),
  ]);
  const r=redemptionAgg[0] || { redemptions:0, discountAmount:0, orderAmount:0, finalAmount:0, uniqueUsers:0, uniquePromos:0 };
  return {
    range:{from:start,to:end},
    overview:{totalPromos:totals,activePromos:active,inactivePromos:Math.max(0,totals-active),redemptions:r.redemptions,discountAmount:r.discountAmount,grossOrderAmount:r.orderAmount,finalPaidAmount:r.finalAmount,uniqueUsers:r.uniqueUsers,uniquePromos:r.uniquePromos,currentReservations},
    topCodes,
    auditActivity:auditCounts.reduce((acc,x)=>{acc[x._id]=x.count;return acc},{}),
  };
};

export const listPromoAudit = async ({ promoId = null, page = 1, limit = 50 } = {}) => {
  if (promoId) assertObjectId(promoId);
  const safePage=Math.max(Number(page)||1,1), safeLimit=Math.min(Math.max(Number(limit)||50,1),100);
  const query=promoId?{promoCode:promoId}:{};
  const [events,total]=await Promise.all([
    PromoAuditEvent.find(query).sort({createdAt:-1}).skip((safePage-1)*safeLimit).limit(safeLimit).populate("actor","name email").lean(),
    PromoAuditEvent.countDocuments(query)
  ]);
  return { events:events.map(x=>({id:x._id.toString(),promoCode:x.promoCode?.toString()||null,code:x.codeSnapshot,action:x.action,changes:x.changes,createdAt:x.createdAt,actor:x.actor?{id:x.actor._id.toString(),name:x.actor.name,email:x.actor.email}:null})),pagination:{page:safePage,limit:safeLimit,total,totalPages:Math.max(1,Math.ceil(total/safeLimit))}};
};
