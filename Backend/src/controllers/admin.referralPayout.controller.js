import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  listAdminReferralPayouts,
  approveReferralPayout,
  rejectReferralPayout,
  processReferralPayout,
  reconcileReferralPayout,
} from "../services/referralPayoutProcessing.service.js";

export const listAdminReferralPayoutsController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral payouts fetched successfully.",
    data: {
      payouts: await listAdminReferralPayouts({
        status: req.query.status,
        limit: req.query.limit,
      }),
    },
  })
);

export const approveAdminReferralPayoutController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral payout approved successfully.",
    data: {
      payout: await approveReferralPayout({
        payoutId: req.params.payoutId,
        adminId: req.user.userId,
        reason: req.body?.reason,
      }),
    },
  })
);

export const rejectAdminReferralPayoutController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral payout rejected successfully.",
    data: {
      payout: await rejectReferralPayout({
        payoutId: req.params.payoutId,
        adminId: req.user.userId,
        reason: req.body?.reason,
      }),
    },
  })
);

export const processAdminReferralPayoutController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral payout processing completed.",
    data: {
      payout: await processReferralPayout({
        payoutId: req.params.payoutId,
        adminId: req.user.userId,
      }),
    },
  })
);

export const reconcileAdminReferralPayoutController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Referral payout reconciliation completed.",
    data: {
      payout: await reconcileReferralPayout({
        payoutId: req.params.payoutId,
        adminId: req.user.userId,
      }),
    },
  })
);
