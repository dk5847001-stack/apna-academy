import { verifyWebhookSignature } from "../services/razorpayX.service.js";
import {
  finalizeProcessedPayout,
  failReferralPayout,
  reverseProcessedPayout,
  reconcileReferralPayout,
} from "../services/referralPayoutProcessing.service.js";
import ReferralPayout from "../models/ReferralPayout.js";

const providerPayoutFromBody = (body) =>
  body?.payload?.payout?.entity || null;

export const handleRazorpayXReferralWebhook = async (req, res) => {
  const signature = req.get("X-Razorpay-Signature");

  if (!verifyWebhookSignature({ rawBody: req.body, signature })) {
    return res.status(401).json({
      success: false,
      message: "Invalid webhook signature.",
    });
  }

  let body;

  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook payload.",
    });
  }

  const event = String(body?.event || "");
  const providerPayout = providerPayoutFromBody(body);
  const providerPayoutId = providerPayout?.id;

  if (!providerPayoutId) {
    return res.status(200).json({ success: true });
  }

  const payout = await ReferralPayout.findOne({
    providerPayoutId,
  }).select("_id status");

  if (!payout) {
    return res.status(200).json({ success: true });
  }

  if (
    event === "payout.processed" ||
    (event === "payout.updated" && providerPayout.status === "processed")
  ) {
    await finalizeProcessedPayout({
      payoutId: payout._id,
      provider: {
        providerPayoutId: providerPayout.id,
        providerFundAccountId: providerPayout.fund_account_id,
        providerStatus: providerPayout.status,
        providerReferenceId: providerPayout.reference_id,
        providerUtr: providerPayout.utr,
        amountPaise: Number(providerPayout.amount),
        currency: providerPayout.currency,
        providerFailureReason: providerPayout.failure_reason || providerPayout.status_details?.description || null,
        providerFailureCode: providerPayout.error?.reason || providerPayout.status_details?.reason || null,
      },
    });
  } else if (
    event === "payout.reversed" ||
    (event === "payout.updated" && providerPayout.status === "reversed")
  ) {
    await reverseProcessedPayout({
      payoutId: payout._id,
      provider: {
        providerPayoutId: providerPayout.id,
        providerFundAccountId: providerPayout.fund_account_id,
        providerStatus: providerPayout.status,
        providerReferenceId: providerPayout.reference_id,
        providerUtr: providerPayout.utr,
        amountPaise: Number(providerPayout.amount),
        currency: providerPayout.currency,
        providerFailureReason: providerPayout.failure_reason || providerPayout.status_details?.description || null,
        providerFailureCode: providerPayout.error?.reason || providerPayout.status_details?.reason || null,
      },
      reason: providerPayout.failure_reason || providerPayout.status_details?.description || "RazorpayX reported a reversal.",
    });
  } else if (
    event === "payout.failed" ||
    event === "payout.rejected" ||
    event === "payout.cancelled" ||
    (event === "payout.updated" && ["failed", "rejected", "cancelled"].includes(providerPayout.status))
  ) {
    await failReferralPayout({
      payoutId: payout._id,
      provider: {
        providerPayoutId: providerPayout.id,
        providerFundAccountId: providerPayout.fund_account_id,
        providerStatus: providerPayout.status,
        providerReferenceId: providerPayout.reference_id,
        providerUtr: providerPayout.utr,
        amountPaise: Number(providerPayout.amount),
        currency: providerPayout.currency,
        providerFailureReason: providerPayout.failure_reason || providerPayout.status_details?.description || null,
        providerFailureCode: providerPayout.error?.reason || providerPayout.status_details?.reason || null,
      },
      reason: providerPayout.failure_reason || providerPayout.status_details?.description || "RazorpayX reported a payout failure.",
      code: providerPayout.error?.reason || providerPayout.status_details?.reason || providerPayout.status || "PROVIDER_FAILURE",
    });
  } else if (payout.status === "processing") {
    await reconcileReferralPayout({
      payoutId: payout._id,
      adminId: null,
    }).catch(() => undefined);
  }

  return res.status(200).json({ success: true });
};
