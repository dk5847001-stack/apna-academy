import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAdminPurchase, listAdminPurchases } from "../services/admin.purchase.service.js";

export const listPurchases = asyncHandler(async (req, res) => {
  const data = await listAdminPurchases({
    page: req.query?.page,
    limit: req.query?.limit,
    search: req.query?.search,
    status: req.query?.status,
    purchaseType: req.query?.purchaseType,
  });
  return successResponse({ res, message: "Purchases loaded successfully.", data });
});

export const getPurchase = asyncHandler(async (req, res) => {
  const data = await getAdminPurchase(req.params.purchaseId);
  return successResponse({ res, message: "Purchase loaded successfully.", data });
});
