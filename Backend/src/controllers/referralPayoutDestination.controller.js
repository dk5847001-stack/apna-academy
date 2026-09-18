import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  getMyReferralPayoutDestination,
  saveReferralPayoutDestination,
  verifyMyReferralPayoutDestination,
  refreshMyReferralPayoutDestinationVerification,
} from "../services/referralPayoutDestination.service.js";

export const getReferralPayoutDestinationController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Payout destination fetched successfully.",
    data: { destination: await getMyReferralPayoutDestination(req.user.userId) },
  })
);

export const saveReferralPayoutDestinationController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    statusCode: 201,
    message: "Payout destination saved securely.",
    data: {
      destination: await saveReferralPayoutDestination({
        userId: req.user.userId,
        ...req.body,
      }),
    },
  })
);

export const verifyReferralPayoutDestinationController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Payout destination verification initiated.",
    data: {
      destination: await verifyMyReferralPayoutDestination(req.user.userId),
    },
  })
);

export const refreshReferralPayoutDestinationController = asyncHandler(async (req, res) =>
  successResponse({
    res,
    message: "Payout destination verification status refreshed.",
    data: {
      destination: await refreshMyReferralPayoutDestinationVerification(req.user.userId),
    },
  })
);
