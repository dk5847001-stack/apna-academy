import crypto from "node:crypto";

const buckets = new Map();

const positiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.get("X-Request-ID")?.trim() || crypto.randomUUID();
  req.requestId = requestId.slice(0, 128);
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

export const createRateLimiter = ({
  windowMs = 60_000,
  max = 120,
  keyPrefix = "global",
} = {}) => {
  const window = positiveNumber(windowMs, 60_000);
  const limit = Math.max(1, Math.floor(positiveNumber(max, 120)));

  return (req, res, next) => {
    const key = keyPrefix + ":" + (req.ip || req.socket.remoteAddress || "unknown");
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + window };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, limit - bucket.count);
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > limit) {
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please retry shortly.",
        requestId: req.requestId,
      });
    }

    return next();
  };
};

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60_000);

cleanup.unref?.();
