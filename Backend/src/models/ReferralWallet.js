import mongoose from "mongoose";

const referralWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /*
     * Cached balances are integer paise. They will be changed only through
     * backend transactional ledger operations in later referral phases.
     */
    totalEarnedPaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Total earned balance must be a safe integer number of paise.",
      },
    },

    availableBalancePaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Available balance must be a safe integer number of paise.",
      },
    },

    pendingBalancePaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Pending balance must be a safe integer number of paise.",
      },
    },

    lockedBalancePaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Locked balance must be a safe integer number of paise.",
      },
    },

    paidOutPaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Paid out balance must be a safe integer number of paise.",
      },
    },

    reversedPaise: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Reversed balance must be a safe integer number of paise.",
      },
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    version: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Wallet version must be a safe integer.",
      },
    },

    lastTransactionAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReferralWallet = mongoose.model(
  "ReferralWallet",
  referralWalletSchema
);

export default ReferralWallet;
