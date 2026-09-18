import mongoose from "mongoose";

const PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,49}$/;

const promoCodeSchema = new mongoose.Schema(
  {
    /*
     * Promo codes are normalized to uppercase before storage.
     * Example: "welcome20" -> "WELCOME20"
     */
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 50,
      match: PROMO_CODE_PATTERN,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      index: true,
    },

    /*
     * percentage: 0 < discountValue <= 100
     * fixed:     discountValue is an INR amount > 0
     */
    discountValue: {
      type: Number,
      required: true,
      min: 0.01,
      validate: {
        validator(value) {
          if (this.discountType === "percentage") {
            return value <= 100;
          }

          return value > 0;
        },
        message:
          "Percentage discount cannot exceed 100%, and fixed discount must be greater than 0.",
      },
    },

    /*
     * Applies only to percentage discounts.
     * The actual discount can never exceed this amount.
     */
    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator(value) {
          if (value === null || value === undefined) {
            return true;
          }

          return this.discountType === "percentage" && value > 0;
        },
        message:
          "Maximum discount amount is only valid for percentage promos and must be greater than 0.",
      },
    },

    /*
     * Promo is applicable only when the order subtotal reaches this amount.
     */
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Empty array means the promo applies to every eligible course.
     * Otherwise only the listed courses are eligible.
     */
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    /*
     * Empty array means every course category is eligible.
     * Values are stored normalized to lowercase by the application.
     */
    applicableCategories: {
      type: [String],
      default: [],
      validate: {
        validator(values) {
          return Array.isArray(values) && values.every(
            (value) =>
              typeof value === "string" &&
              value.trim().length > 0 &&
              value.trim().length <= 100
          );
        },
        message: "Promo categories must contain valid non-empty strings.",
      },
    },

    startsAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
      validate: {
        validator(value) {
          if (value === null || value === undefined) {
            return true;
          }

          return !this.startsAt || value > this.startsAt;
        },
        message: "Promo expiry must be later than its start time.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /*
     * null means unlimited total usage.
     */
    usageLimit: {
      type: Number,
      default: null,
      min: 1,
      validate: {
        validator(value) {
          return value === null || Number.isInteger(value);
        },
        message: "Usage limit must be a whole number.",
      },
    },

    /*
     * null means unlimited usage per user, subject to total usageLimit.
     * Actual per-user redemption records will be implemented in a later phase.
     */
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: "Per-user usage limit must be a whole number.",
      },
    },

    /*
     * Incremented only after a successfully completed/verified purchase.
     * It must never be trusted for frontend pricing.
     */
    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: "Reserved count must be a whole number.",
      },
      index: true,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: "Used count must be a whole number.",
      },
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Keep category values predictable for later backend matching.
 */
promoCodeSchema.pre("validate", function normalizeCategories(next) {
  if (Array.isArray(this.applicableCategories)) {
    this.applicableCategories = [
      ...new Set(
        this.applicableCategories
          .map((value) => String(value).trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
  }

  next();
});

/*
 * A promo cannot have a maximum discount cap when it is a fixed discount.
 * This is checked again here because validators may not run on every update
 * path unless runValidators is explicitly enabled.
 */
promoCodeSchema.pre("validate", function validateDiscountConfiguration(next) {
  if (
    this.discountType === "fixed" &&
    this.maxDiscountAmount !== null &&
    this.maxDiscountAmount !== undefined
  ) {
    this.invalidate(
      "maxDiscountAmount",
      "Maximum discount amount is only valid for percentage promos."
    );
  }

  if (
    this.discountType === "percentage" &&
    (!Number.isFinite(this.discountValue) ||
      this.discountValue <= 0 ||
      this.discountValue > 100)
  ) {
    this.invalidate(
      "discountValue",
      "Percentage discount must be greater than 0 and at most 100."
    );
  }

  if (
    this.usageLimit !== null &&
    this.usageLimit !== undefined &&
    this.usedCount > this.usageLimit
  ) {
    this.invalidate(
      "usedCount",
      "Used count cannot exceed the total usage limit."
    );
  }

  next();
});

/*
 * Hot validation lookup:
 * - exact normalized code
 * - active state
 * - start/expiry window
 */
promoCodeSchema.index({
  code: 1,
  isActive: 1,
  startsAt: 1,
  expiresAt: 1,
});

/*
 * Useful for the future admin dashboard list/filter screens.
 */
promoCodeSchema.index({ isActive: 1, expiresAt: 1, createdAt: -1 });
promoCodeSchema.index({ createdBy: 1, createdAt: -1 });

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;
