import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getMyReferralDetails } from "../services/referral.service.js";

export const getMyReferral = asyncHandler(async (req, res) => {
  const data = await getMyReferralDetails(req.user.userId);

  return successResponse({
    res,
    message: "Referral details fetched successfully.",
    data,
  });
});
