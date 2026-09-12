import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

import {
  validateRegisterInput,
  validateLoginInput,
} from "../validators/auth.validator.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/*
|--------------------------------------------------------------------------
| Authentication Cookie Configuration
|--------------------------------------------------------------------------
*/

const AUTH_COOKIE_NAME = "apnaacademy_token";

const getCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "lax" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

/*
|--------------------------------------------------------------------------
| Set Authentication Cookie
|--------------------------------------------------------------------------
*/

const setAuthenticationCookie = (
  res,
  token
) => {
  res.cookie(
    AUTH_COOKIE_NAME,
    token,
    getCookieOptions()
  );
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export const register = asyncHandler(
  async (req, res) => {
    const {
      name,
      email,
      password,
    } = req.body;

    const errors =
      validateRegisterInput({
        name,
        email,
        password,
      });

    if (
      Object.keys(errors).length > 0
    ) {
      const error = new Error(
        "Please correct the validation errors."
      );

      error.statusCode = 400;
      error.errors = errors;

      throw error;
    }

    const result =
      await registerUser({
        name,
        email,
        password,
      });

    /*
     * Store JWT in an HttpOnly cookie.
     *
     * The browser will automatically send
     * this cookie to the backend from the
     * Frontend, Dashboard and Course apps.
     */
    setAuthenticationCookie(
      res,
      result.token
    );

    return successResponse({
      res,
      statusCode: 201,
      message:
        "Account created successfully.",
      data: result,
    });
  }
);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const login = asyncHandler(
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    const errors =
      validateLoginInput({
        email,
        password,
      });

    if (
      Object.keys(errors).length > 0
    ) {
      const error = new Error(
        "Please correct the validation errors."
      );

      error.statusCode = 400;
      error.errors = errors;

      throw error;
    }

    const result =
      await loginUser({
        email,
        password,
      });

    /*
     * IMPORTANT
     *
     * Keep the JWT out of the browser-accessible
     * localStorage/sessionStorage flow.
     *
     * HttpOnly prevents JavaScript from reading
     * the authentication token.
     */
    setAuthenticationCookie(
      res,
      result.token
    );

    return successResponse({
      res,
      message: "Login successful.",
      data: result,
    });
  }
);

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export const me = asyncHandler(
  async (req, res) => {
    const user =
      await getCurrentUser(
        req.user.userId
      );

    return successResponse({
      res,
      message:
        "Current user fetched successfully.",
      data: user,
    });
  }
);

/* =========================================================
   LOGOUT
========================================================= */

export const logout = async (req, res) => {
  const isProduction =
    process.env.NODE_ENV === "production";

  res.clearCookie("apnaacademy_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};