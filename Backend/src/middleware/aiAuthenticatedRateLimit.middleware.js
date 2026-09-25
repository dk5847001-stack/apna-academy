const buckets = new Map();

const cleanupExpired = (now) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

const consume = (key, limit, windowMs, now) => {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterMs: 0,
  };
};

export const createAuthenticatedAIRateLimiter = ({
  windowMs,
  maxRequests,
  dailyWindowMs,
  dailyMaxRequests,
}) => {
  return (req, res, next) => {
    const now = Date.now();

    if (buckets.size > 5000) cleanupExpired(now);

    const userKey = `user:${req.aiUserId || req.authenticatedUser?._id?.toString() || "unknown"}`;
    const ipKey = `ip:${req.aiClientIp || req.ip || "unknown"}`;
    const dailyKey = `daily:${userKey}`;

    const userWindow = consume(userKey, maxRequests, windowMs, now);
    const ipWindow = consume(ipKey, maxRequests, windowMs, now);
    const dailyWindow = consume(dailyKey, dailyMaxRequests, dailyWindowMs, now);

    const failed = [userWindow, ipWindow, dailyWindow].find((result) => !result.allowed);

    if (failed) {
      const retryAfterSeconds = Math.max(1, Math.ceil(failed.retryAfterMs / 1000));
      res.set("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        success: false,
        message: "AI request limit reached. Please try again later.",
        code: "AI_RATE_LIMITED",
        retryAfterSeconds,
      });
    }

    res.set(
      "X-AI-RateLimit-Remaining",
      String(Math.min(userWindow.remaining, ipWindow.remaining, dailyWindow.remaining))
    );

    return next();
  };
};
