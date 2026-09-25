const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

export const requireVerifiedAIUser = (req, res, next) => {
  const user = req.authenticatedUser;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
      code: "AI_AUTHENTICATION_REQUIRED",
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Your account is not active.",
      code: "AI_ACCOUNT_INACTIVE",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email before using the AI assistant.",
      code: "AI_EMAIL_VERIFICATION_REQUIRED",
    });
  }

  req.aiClientIp = getClientIp(req);
  req.aiUserId = user._id.toString();

  return next();
};
