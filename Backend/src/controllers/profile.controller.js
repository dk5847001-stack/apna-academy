import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  getProfile,
  updateProfile,
} from "../services/profile.service.js";

export const getStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const profile = await getProfile(userId);

  return successResponse({
    res,
    message: "Profile loaded successfully.",
    data: profile,
  });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const profile = await updateProfile({
    userId,
    name: req.body?.name,
    phone: req.body?.phone,
    avatar: req.body?.avatar,
  });

  return successResponse({
    res,
    message: "Profile updated successfully.",
    data: profile,
  });
});