import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { validatePromoCode } from "../services/promoCode.service.js";

/**
 * POST /api/v1/promocodes/validate
 *
 * Authentication is required because promo eligibility can depend on
 * per-user redemption limits.
 */
export const validatePromo = asyncHandler(async (req, res) => {
  const { code, courseId, amount } = req.body || {};

  const result = await validatePromoCode({
    userId: req.user.userId,
    code,
    courseId,
    amount,
  });

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: result.message,
      code: result.code,
    });
  }

  return successResponse({
    res,
    message: "Promo code applied successfully.",
    data: result,
  });
});
