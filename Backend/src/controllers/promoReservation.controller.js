import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { releasePromoReservation } from "../services/promoReservation.service.js";

export const releasePromo = asyncHandler(async (req, res) => {
  const { razorpayOrderId } = req.body || {};

  if (!razorpayOrderId || typeof razorpayOrderId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Razorpay order ID is required.",
    });
  }

  const released = await releasePromoReservation({
    razorpayOrderId: razorpayOrderId.trim(),
    userId: req.user.userId,
  });

  return successResponse({
    res,
    message: released
      ? "Promo reservation released successfully."
      : "Promo reservation was already released or does not exist.",
    data: { released },
  });
});
