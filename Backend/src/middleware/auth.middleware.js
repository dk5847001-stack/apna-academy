import { verifyAccessToken } from "../utils/token.js";

/*
|--------------------------------------------------------------------------
| Authentication Cookie
|--------------------------------------------------------------------------
*/

const AUTH_COOKIE_NAME =
  "apnaacademy_token";

/*
|--------------------------------------------------------------------------
| Parse Cookies
|--------------------------------------------------------------------------
|
| We intentionally parse the Cookie header ourselves.
| This avoids adding another dependency such as cookie-parser.
|
*/

const parseCookies = (cookieHeader = "") => {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const separatorIndex =
      part.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = part
      .slice(0, separatorIndex)
      .trim();

    const rawValue = part
      .slice(separatorIndex + 1)
      .trim();

    if (!key) {
      continue;
    }

    try {
      cookies[key] =
        decodeURIComponent(rawValue);
    } catch {
      cookies[key] = rawValue;
    }
  }

  return cookies;
};

/*
|--------------------------------------------------------------------------
| Get Token From Request
|--------------------------------------------------------------------------
|
| Priority:
|
| 1. HttpOnly authentication cookie
| 2. Authorization Bearer header
|
| Cookie becomes the preferred authentication
| mechanism for our separate React apps.
|
*/

const getAuthenticationToken = (req) => {
  const cookies = parseCookies(
    req.headers.cookie
  );

  const cookieToken =
    cookies[AUTH_COOKIE_NAME];

  if (cookieToken) {
    return cookieToken;
  }

  const authorization =
    req.headers.authorization;

  if (
    authorization &&
    authorization.startsWith("Bearer ")
  ) {
    const bearerToken =
      authorization.slice(7).trim();

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
*/

export const authenticate = (
  req,
  res,
  next
) => {
  try {
    const token =
      getAuthenticationToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const decoded =
      verifyAccessToken(token);

    if (
      !decoded ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token.",
    });
  }
};