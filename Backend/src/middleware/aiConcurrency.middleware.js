const activeByUser = new Map();
const activeByIp = new Map();

const increment = (map, key) => {
  map.set(key, (map.get(key) || 0) + 1);
};

const decrement = (map, key) => {
  const next = (map.get(key) || 1) - 1;
  if (next <= 0) map.delete(key);
  else map.set(key, next);
};

export const createAIConcurrencyLimiter = ({ maxPerUser = 2, maxPerIp = 3 } = {}) => {
  return (req, res, next) => {
    const userKey = req.aiUserId || "anonymous";
    const ipKey = req.aiClientIp || req.ip || "unknown";
    const userActive = activeByUser.get(userKey) || 0;
    const ipActive = activeByIp.get(ipKey) || 0;

    if (userActive >= maxPerUser || ipActive >= maxPerIp) {
      return res.status(429).json({
        success: false,
        message: "Too many AI requests are being processed at once. Please wait for the current response.",
        code: "AI_CONCURRENCY_LIMITED",
      });
    }

    increment(activeByUser, userKey);
    increment(activeByIp, ipKey);

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      decrement(activeByUser, userKey);
      decrement(activeByIp, ipKey);
    };

    res.once("finish", release);
    res.once("close", release);

    return next();
  };
};
