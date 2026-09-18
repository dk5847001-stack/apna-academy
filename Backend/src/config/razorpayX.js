import "dotenv/config";

const trimEnv = (name) => String(process.env[name] || "").trim();

export const isRazorpayXEnabled =
  trimEnv("RAZORPAYX_ENABLED").toLowerCase() === "true";

export const getRazorpayXConfig = () => {
  if (!isRazorpayXEnabled) {
    const error = new Error("RazorpayX payouts are not enabled.");
    error.statusCode = 503;
    error.code = "RAZORPAYX_DISABLED";
    throw error;
  }

  const config = {
    keyId: trimEnv("RAZORPAYX_KEY_ID"),
    keySecret: trimEnv("RAZORPAYX_KEY_SECRET"),
    accountNumber: trimEnv("RAZORPAYX_ACCOUNT_NUMBER"),
    webhookSecret: trimEnv("RAZORPAYX_WEBHOOK_SECRET"),
    timeoutMs: Number(process.env.RAZORPAYX_TIMEOUT_MS || 15000),
  };

  const missing = [
    ["RAZORPAYX_KEY_ID", config.keyId],
    ["RAZORPAYX_KEY_SECRET", config.keySecret],
    ["RAZORPAYX_ACCOUNT_NUMBER", config.accountNumber],
    ["RAZORPAYX_WEBHOOK_SECRET", config.webhookSecret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    const error = new Error(
      `RazorpayX configuration is incomplete: ${missing.join(", ")}`
    );
    error.statusCode = 503;
    error.code = "RAZORPAYX_CONFIGURATION_MISSING";
    throw error;
  }

  if (
    !Number.isSafeInteger(config.timeoutMs) ||
    config.timeoutMs < 1000 ||
    config.timeoutMs > 60000
  ) {
    const error = new Error(
      "RAZORPAYX_TIMEOUT_MS must be an integer between 1000 and 60000."
    );
    error.statusCode = 500;
    error.code = "RAZORPAYX_CONFIGURATION_INVALID";
    throw error;
  }

  return Object.freeze(config);
};
