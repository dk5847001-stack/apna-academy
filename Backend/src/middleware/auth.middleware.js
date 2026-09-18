import User from "../models/User.js";
import { verifyAccessToken } from "../utils/token.js";

/*
|--------------------------------------------------------------------------
| Authentication Cookie
|--------------------------------------------------------------------------
*/

const AUTH_COOKIE_NAME = "apnaacademy_token";

/*
|--------------------------------------------------------------------------
| Parse Cookies
|--------------------------------------------------------------------------
*/

const parseCookies = (cookieHeader = "") => {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    try {
      cookies[key] = decodeURIComponent(rawValue);
    } catch {
      cookies[key] = rawValue;
    }
  }

  return cookies;
};

const getAuthenticationToken = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[AUTH_COOKIE_NAME];

  if (cookieToken) {
    return cookieToken;
  }

  const authorization = req.headers.authorization;

  if (authorization && authorization.startsWith("Bearer ")) {
    const bearerToken = authorization.slice(7).trim();

    if (bearerToken) {
      return bearerToken;
    }
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Authenticate User
|--------------------------------------------------------------------------
|
| A JWT is not sufficient on its own. Its sessionId must still match the
| single active session stored on the user's account.
|
*/

export const authenticate = async (req, res, next) => {
  try {
    const token = getAuthenticationToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded?.userId || !decoded?.sessionId) {
      return res.status(401).json({
        success: false,
        message: "This authentication session is no longer valid.",
        code: "SESSION_INVALIDATED",
      });
    }

    const user = await User.findById(decoded.userId).select(
      "+activeSessionId +concurrentLoginDetectionCount"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication account was not found.",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    if (user.activeSessionId !== decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Your session was ended because this account was signed in elsewhere.",
        code: "SESSION_REPLACED",
        security: {
          concurrentLoginDetected: true,
          detectionCount: user.concurrentLoginDetectionCount || 0,
          detectionLimit: 5,
          remainingDetections: Math.max(
            0,
            5 - (user.concurrentLoginDetectionCount || 0)
          ),
        },
      });
    }

    req.user = decoded;
    req.authenticatedUser = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session.",
      code: "INVALID_SESSION",
    });
  }
};
