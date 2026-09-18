import mongoose from "mongoose";

import PromoCode from "../models/PromoCode.js";
import PromoRedemption from "../models/PromoRedemption.js";
import Course from "../models/Course.js";

const normalizePromoCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const isPromoCurrentlyValid = (promo, now = new Date()) => {
  if (!promo || !promo.isActive) {
    return {
      valid: false,
      code: "PROMO_INACTIVE",
      message: "This promo code is inactive.",
    };
  }

  if (promo.startsAt && now < new Date(promo.startsAt)) {
    return {
      valid: false,
      code: "PROMO_NOT_STARTED",
      message: "This promo code is not active yet.",
    };
  }

  if (promo.expiresAt && now >= new Date(promo.expiresAt)) {
    return {
      valid: false,
      code: "PROMO_EXPIRED",
      message: "This promo code has expired.",
    };
  }

  if (
    promo.usageLimit !== null &&
    promo.usageLimit !== undefined &&
    Number(promo.usedCount || 0) + Number(promo.reservedCount || 0) >= promo.usageLimit
  ) {
    return {
      valid: false,
      code: "PROMO_USAGE_LIMIT_REACHED",
      message: "This promo code has reached its usage limit.",
    };
  }

  return { valid: true };
};

const calculateDiscount = ({ promo, amount }) => {
  const subtotal = roundCurrency(amount);

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return {
      valid: false,
      code: "INVALID_PURCHASE_AMOUNT",
      message: "Purchase amount must be greater than zero.",
    };
  }

  if (subtotal < Number(promo.minPurchaseAmount || 0)) {
    return {
      valid: false,
      code: "MIN_PURCHASE_NOT_MET",
      message: `A minimum purchase of ₹${roundCurrency(
        promo.minPurchaseAmount
      )} is required for this promo code.`,
    };
  }

  let discountAmount;

  if (promo.discountType === "percentage") {
    discountAmount = (subtotal * Number(promo.discountValue)) / 100;

    if (
      promo.maxDiscountAmount !== null &&
      promo.maxDiscountAmount !== undefined
    ) {
      discountAmount = Math.min(
        discountAmount,
        Number(promo.maxDiscountAmount)
      );
    }
  } else {
    discountAmount = Number(promo.discountValue);
  }

  discountAmount = roundCurrency(
    Math.min(Math.max(discountAmount, 0), subtotal)
  );

  const finalAmount = roundCurrency(
    Math.max(subtotal - discountAmount, 0)
  );

  if (discountAmount <= 0 || finalAmount >= subtotal) {
    return {
      valid: false,
      code: "NO_EFFECTIVE_DISCOUNT",
      message: "This promo code does not provide a valid discount for this purchase.",
    };
  }

  return {
    valid: true,
    originalAmount: subtotal,
    discountAmount,
    finalAmount,
  };
};

const checkCourseEligibility = (promo, course) => {
  if (!course || !course.isPublished) {
    return {
      valid: false,
      code: "COURSE_NOT_FOUND",
      message: "Course not found.",
    };
  }

  const courseId = course._id.toString();

  if (
    Array.isArray(promo.applicableCourses) &&
    promo.applicableCourses.length > 0 &&
    !promo.applicableCourses.some(
      (id) => id.toString() === courseId
    )
  ) {
    return {
      valid: false,
      code: "PROMO_NOT_APPLICABLE_TO_COURSE",
      message: "This promo code is not valid for this course.",
    };
  }

  if (
    Array.isArray(promo.applicableCategories) &&
    promo.applicableCategories.length > 0
  ) {
    const category = String(course.category || "")
      .trim()
      .toLowerCase();

    if (!promo.applicableCategories.includes(category)) {
      return {
        valid: false,
        code: "PROMO_NOT_APPLICABLE_TO_CATEGORY",
        message: "This promo code is not valid for this course category.",
      };
    }
  }

  return { valid: true };
};

export const validatePromoCode = async ({
  userId,
  code,
  courseId,
  amount,
}) => {
  const normalizedCode = normalizePromoCode(code);

  if (!normalizedCode) {
    return {
      valid: false,
      code: "PROMO_CODE_REQUIRED",
      message: "Promo code is required.",
    };
  }

  if (!/^[A-Z0-9][A-Z0-9_-]{2,49}$/.test(normalizedCode)) {
    return {
      valid: false,
      code: "INVALID_PROMO_CODE_FORMAT",
      message: "Enter a valid promo code.",
    };
  }

  if (!mongoose.isValidObjectId(courseId)) {
    return {
      valid: false,
      code: "INVALID_COURSE",
      message: "Invalid course.",
    };
  }

  if (!mongoose.isValidObjectId(userId)) {
    return {
      valid: false,
      code: "INVALID_USER",
      message: "Invalid authenticated user.",
    };
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return {
      valid: false,
      code: "INVALID_PURCHASE_AMOUNT",
      message: "Purchase amount must be greater than zero.",
    };
  }

  const promo = await PromoCode.findOne({
    code: normalizedCode,
  }).lean();

  if (!promo) {
    return {
      valid: false,
      code: "PROMO_NOT_FOUND",
      message: "Invalid promo code.",
    };
  }

  const status = isPromoCurrentlyValid(promo);

  if (!status.valid) {
    return status;
  }

  const course = await Course.findById(courseId)
    .select("_id title category price isPublished")
    .lean();

  const courseEligibility = checkCourseEligibility(promo, course);

  if (!courseEligibility.valid) {
    return courseEligibility;
  }

  /*
   * The client-supplied amount is only a candidate value at this stage.
   * The payment-order phase will load the course price itself and recalculate
   * the final payable amount on the server before creating the Razorpay order.
   */
  const discount = calculateDiscount({
    promo,
    amount: numericAmount,
  });

  if (!discount.valid) {
    return discount;
  }

  const perUserLimit =
    promo.perUserLimit === null || promo.perUserLimit === undefined
      ? null
      : Number(promo.perUserLimit);

  let userRedemptionCount = 0;

  if (perUserLimit !== null) {
    userRedemptionCount = await PromoRedemption.countDocuments({
      promoCode: promo._id,
      user: userId,
    });

    if (userRedemptionCount >= perUserLimit) {
      return {
        valid: false,
        code: "PROMO_USER_LIMIT_REACHED",
        message: "You have already used this promo code the maximum allowed number of times.",
      };
    }
  }

  return {
    valid: true,
    promo: {
      id: promo._id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxDiscountAmount: promo.maxDiscountAmount,
      minPurchaseAmount: promo.minPurchaseAmount,
    },
    pricing: discount,
    eligibility: {
      courseId: course._id,
      category: course.category,
    },
    usage: {
      totalUsed: promo.usedCount,
      totalLimit: promo.usageLimit,
      perUserUsed: userRedemptionCount,
      perUserLimit,
    },
  };
};
