import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getAdminUser, getAdminUserDetails, listAdminUsers, updateAdminUser, getAdminSecurityDetails, unfreezeUserSecurity, blockAdminUser, unblockAdminUser, activateAdminUser } from "../services/admin.user.service.js";

export const listUsers = asyncHandler(async (req, res) => {
  const data = await listAdminUsers({ page: req.query?.page, limit: req.query?.limit, search: req.query?.search, role: req.query?.role, status: req.query?.status });
  return successResponse({ res, message: "Users loaded successfully.", data });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await getAdminUser(req.params.userId);
  return successResponse({ res, message: "User loaded successfully.", data: user });
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const data = await getAdminUserDetails(req.params.userId);
  return successResponse({ res, message: "User details loaded successfully.", data });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await updateAdminUser({ userId: req.params.userId, actorId: req.user.userId, role: req.body?.role, status: req.body?.status });
  return successResponse({ res, message: "User updated successfully.", data: user });
});


export const getSecurityDetails = asyncHandler(async (req, res) => {
  const data = await getAdminSecurityDetails(req.params.userId);
  return successResponse({
    res,
    message: "User security details loaded successfully.",
    data,
  });
});

export const unfreezeSecurity = asyncHandler(async (req, res) => {
  const user = await unfreezeUserSecurity({
    userId: req.params.userId,
    actorId: req.user.userId,
  });

  return successResponse({
    res,
    message: "Account security freeze removed successfully. The user must sign in again.",
    data: user,
  });
});


export const blockUser = asyncHandler(async (req, res) => {
  const user = await blockAdminUser({
    userId: req.params.userId,
    actorId: req.user.userId,
    reason: req.body?.reason,
  });
  return successResponse({ res, message: "User blocked successfully.", data: user });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await unblockAdminUser({
    userId: req.params.userId,
    actorId: req.user.userId,
  });
  return successResponse({ res, message: "User unblocked successfully.", data: user });
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await activateAdminUser({
    userId: req.params.userId,
    actorId: req.user.userId,
  });
  return successResponse({ res, message: "Suspended user activated successfully.", data: user });
});
