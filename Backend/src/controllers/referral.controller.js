import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getMyReferralDetails } from "../services/referral.service.js";
import { getMyReferralWallet } from "../services/referralWallet.service.js";

export const getMyReferral = asyncHandler(async (req, res) => {
  const data = await getMyReferralDetails(req.user.userId);

  return successResponse({
    res,
    message: "Referral details fetched successfully.",
    data,
  });
});

export const getMyReferralWalletController = asyncHandler(async (req, res) => {
  const data = await getMyReferralWallet(req.user.userId);

  return successResponse({
    res,
    message: "Referral wallet fetched successfully.",
    data,
  });
});
