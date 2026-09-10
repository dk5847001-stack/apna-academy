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

export const register = asyncHandler(
  async (req, res) => {
    const { name, email, password } = req.body;

    const errors = validateRegisterInput({
      name,
      email,
      password,
    });

    if (Object.keys(errors).length > 0) {
      const error = new Error(
        "Please correct the validation errors."
      );

      error.statusCode = 400;
      error.errors = errors;

      throw error;
    }

    const result = await registerUser({
      name,
      email,
      password,
    });

    return successResponse({
      res,
      statusCode: 201,
      message: "Account created successfully.",
      data: result,
    });
  }
);

export const login = asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;

    const errors = validateLoginInput({
      email,
      password,
    });

    if (Object.keys(errors).length > 0) {
      const error = new Error(
        "Please correct the validation errors."
      );

      error.statusCode = 400;
      error.errors = errors;

      throw error;
    }

    const result = await loginUser({
      email,
      password,
    });

    return successResponse({
      res,
      message: "Login successful.",
      data: result,
    });
  }
);

export const me = asyncHandler(
  async (req, res) => {
    const user = await getCurrentUser(
      req.user.userId
    );

    return successResponse({
      res,
      message: "Current user fetched successfully.",
      data: user,
    });
  }
);