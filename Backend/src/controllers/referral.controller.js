import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getMyReferralDetails } from "../services/referral.service.js";
import { getMyReferralWallet } from "../services/referralWallet.service.js";
import {
  requestReferralWithdrawal,
  listMyReferralPayouts,
} from "../services/referralPayout.service.js";

export const getMyReferral = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral details fetched successfully.",
    data: await getMyReferralDetails(req.user.userId),
  })
);

export const getMyReferralWalletController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral wallet fetched successfully.",
    data: await getMyReferralWallet(req.user.userId),
  })
);

export const requestReferralWithdrawalController = asyncHandler(
  async (req, res) => {
    const idempotencyKey = req.get("Idempotency-Key");

    const payout = await requestReferralWithdrawal({
      userId: req.user.userId,
      idempotencyKey,
      ...req.body,
    });

    return successResponse({
      res,
      statusCode: 201,
      message: "Withdrawal request submitted successfully.",
      data: { payout },
    });
  }
);

export const listReferralPayoutsController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral payouts fetched successfully.",
    data: {
      payouts: await listMyReferralPayouts(req.user.userId),
    },
  })
);
