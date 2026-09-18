import ReferralWallet from "../models/ReferralWallet.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralLedger from "../models/ReferralLedger.js";

const toSafePaise = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
};

const publicWallet = (wallet) => ({
  totalEarnedPaise: toSafePaise(wallet?.totalEarnedPaise),
  availableBalancePaise: toSafePaise(wallet?.availableBalancePaise),
  pendingBalancePaise: toSafePaise(wallet?.pendingBalancePaise),
  lockedBalancePaise: toSafePaise(wallet?.lockedBalancePaise),
  paidOutPaise: toSafePaise(wallet?.paidOutPaise),
  reversedPaise: toSafePaise(wallet?.reversedPaise),
  currency: "INR",
  version: toSafePaise(wallet?.version),
  lastTransactionAt: wallet?.lastTransactionAt || null,
});

export const getOrCreateReferralWallet = async (userId, session = null) => {
  const query = ReferralWallet.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, currency: "INR" } },
    { upsert: true, new: true }
  );
  if (session) query.session(session);
  return query;
};

export const getMyReferralWallet = async (userId) => {
  const wallet = await getOrCreateReferralWallet(userId);
  const rewards = await ReferralReward.find({ referrer: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .select(
      "_id referral amountPaise currency status qualificationPurchase qualifyingPurchaseAmountPaise availableAt paidAt reversedAt createdAt"
    )
    .lean();

  const ledger = await ReferralLedger.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .select(
      "_id reward payout type direction amountPaise currency balanceAfter description createdAt"
    )
    .lean();

  return {
    wallet: publicWallet(wallet),
    rewards,
    transactions: ledger,
  };
};
