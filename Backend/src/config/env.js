import "dotenv/config";

const requiredEnvVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const productionEnvVariables = [
  "BACKEND_PUBLIC_URL",
  "COURSE_PUBLIC_URL",
  "FRONTEND_PUBLIC_URL",
  "CORS_ALLOWED_ORIGINS",
];

export const validateEnv = () => {
  const requiredVariables = [
    ...requiredEnvVariables,
    ...(process.env.NODE_ENV === "production"
      ? productionEnvVariables
      : []),
  ];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]?.trim()
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }

  if (process.env.AI_ENABLED?.trim().toLowerCase() === "true") {
    const aiVariables = ["NVIDIA_NIM_API_KEY", "NVIDIA_MODEL"];
    const missingAIVariables = aiVariables.filter(
      (variable) => !process.env[variable]?.trim()
    );

    if (missingAIVariables.length > 0) {
      throw new Error(
        `AI is enabled but these variables are missing: ${missingAIVariables.join(", ")}`
      );
    }

    const aiBaseUrl =
      process.env.NVIDIA_API_BASE_URL?.trim() ||
      "https://integrate.api.nvidia.com/v1";

    try {
      const url = new URL(aiBaseUrl);
      if (url.protocol !== "https:") {
        throw new Error("NVIDIA_API_BASE_URL must use HTTPS");
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("NVIDIA_API_BASE_URL must be a valid HTTPS URL");
      }
      throw error;
    }
  }

  if (process.env.RAZORPAYX_ENABLED?.trim().toLowerCase() === "true") {
    const razorpayXVariables = [
      "RAZORPAYX_KEY_ID",
      "RAZORPAYX_KEY_SECRET",
      "RAZORPAYX_ACCOUNT_NUMBER",
      "RAZORPAYX_WEBHOOK_SECRET",
      "REFERRAL_PAYOUT_DESTINATION_HMAC_SECRET",
      "REFERRAL_PAYOUT_DESTINATION_ENCRYPTION_KEY",
    ];

    const missingRazorpayXVariables = razorpayXVariables.filter(
      (variable) => !process.env[variable]?.trim()
    );

    if (missingRazorpayXVariables.length > 0) {
      throw new Error(
        `RazorpayX is enabled but these variables are missing: ${missingRazorpayXVariables.join(", ")}`
      );
    }
  }

  if (process.env.NODE_ENV === "production") {
    const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (corsOrigins.length === 0) {
      throw new Error(
        "CORS_ALLOWED_ORIGINS must contain at least one production browser origin"
      );
    }

    for (const variable of [
      "BACKEND_PUBLIC_URL",
      "COURSE_PUBLIC_URL",
      "FRONTEND_PUBLIC_URL",
    ]) {
      const value = process.env[variable].trim();

      try {
        const url = new URL(value);

        if (url.protocol !== "https:") {
          throw new Error(`${variable} must use HTTPS in production`);
        }
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(`${variable} must be a valid HTTPS URL`);
        }

        throw error;
      }
    }

    for (const origin of corsOrigins) {
      try {
        const url = new URL(origin);

        if (url.protocol !== "https:") {
          throw new Error(
            `CORS_ALLOWED_ORIGINS contains a non-HTTPS production origin: ${origin}`
          );
        }
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(
            `CORS_ALLOWED_ORIGINS contains an invalid URL: ${origin}`
          );
        }

        throw error;
      }
    }
  }
};