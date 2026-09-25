const buckets = new Map();

const cleanupExpired = (now) => {
  for (const [key, bucket] of buckets) {
    if (bucket.windowResetAt <= now && bucket.dailyResetAt <= now) buckets.delete(key);
  }
};

const getClientIp = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return String(ip).replace(/^::ffff:/, "");
};

export const createGuestAIRateLimiter = ({ windowMs, maxRequests, dailyMax }) => {
  return (req, res, next) => {
    const now = Date.now();
    cleanupExpired(now);

    const key = "guest-ai:" + getClientIp(req);
    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = {
        windowCount: 0,
        windowResetAt: now + windowMs,
        dailyCount: 0,
        dailyResetAt: now + 86_400_000,
      };
    }

    if (bucket.windowResetAt <= now) {
      bucket.windowCount = 0;
      bucket.windowResetAt = now + windowMs;
    }

    if (bucket.dailyResetAt <= now) {
      bucket.dailyCount = 0;
      bucket.dailyResetAt = now + 86_400_000;
    }

    if (bucket.dailyCount >= dailyMax) {
      res.set("Retry-After", String(Math.ceil((bucket.dailyResetAt - now) / 1000)));
      return res.status(429).json({
        success: false,
        code: "AI_GUEST_DAILY_LIMIT",
        message: "Guest AI daily limit reached. Please sign in to continue with higher limits.",
      });
    }

    if (bucket.windowCount >= maxRequests) {
      res.set("Retry-After", String(Math.ceil((bucket.windowResetAt - now) / 1000)));
      return res.status(429).json({
        success: false,
        code: "AI_GUEST_RATE_LIMIT",
        message: "Too many AI requests. Please wait a moment and try again.",
      });
    }

    bucket.windowCount += 1;
    bucket.dailyCount += 1;
    buckets.set(key, bucket);

    res.set("X-AI-Guest-Remaining", String(Math.max(dailyMax - bucket.dailyCount, 0)));
    return next();
  };
};
