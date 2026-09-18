import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { listAdminPromoCodes, getAdminPromoCode, createAdminPromoCode, updateAdminPromoCode, toggleAdminPromoCode, deleteAdminPromoCode } from "../services/admin.promoCode.service.js";

export const listPromos = asyncHandler(async (req, res) => successResponse({ res, message: "Promo codes loaded successfully.", data: await listAdminPromoCodes({ page: req.query?.page, limit: req.query?.limit, search: req.query?.search, active: req.query?.active }) }));
export const getPromo = asyncHandler(async (req, res) => successResponse({ res, message: "Promo code loaded successfully.", data: await getAdminPromoCode(req.params.promoId) }));
export const createPromo = asyncHandler(async (req, res) => successResponse({ res, message: "Promo code created successfully.", data: await createAdminPromoCode({ actorId: req.user.userId, payload: req.body }) }));
export const updatePromo = asyncHandler(async (req, res) => successResponse({ res, message: "Promo code updated successfully.", data: await updateAdminPromoCode({ promoId: req.params.promoId, actorId: req.user.userId, payload: req.body }) }));
export const togglePromo = asyncHandler(async (req, res) => successResponse({ res, message: "Promo code status updated successfully.", data: await toggleAdminPromoCode({ promoId: req.params.promoId, actorId: req.user.userId, isActive: req.body?.isActive }) }));
export const deletePromo = asyncHandler(async (req, res) => successResponse({ res, message: "Promo code deleted successfully.", data: await deleteAdminPromoCode({ promoId: req.params.promoId }) }));