import User from "../models/User.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
  phone: user.phone || "",
  isEmailVerified: Boolean(user.isEmailVerified),
  status: user.status,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

export const updateProfile = async ({
  userId,
  name,
  phone,
  avatar,
}) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (name !== undefined) {
    const normalizedName = String(name).trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      const error = new Error("Name must be between 2 and 100 characters.");
      error.statusCode = 400;
      throw error;
    }

    user.name = normalizedName;
  }

  if (phone !== undefined) {
    const normalizedPhone = String(phone).trim();

    if (normalizedPhone.length > 30) {
      const error = new Error("Phone number is too long.");
      error.statusCode = 400;
      throw error;
    }

    user.phone = normalizedPhone;
  }

  if (avatar !== undefined) {
    const normalizedAvatar = String(avatar).trim();

    if (normalizedAvatar.length > 500) {
      const error = new Error("Avatar URL is too long.");
      error.statusCode = 400;
      throw error;
    }

    if (normalizedAvatar && !/^https?:\/\//i.test(normalizedAvatar)) {
      const error = new Error("Avatar must be a valid HTTP(S) URL.");
      error.statusCode = 400;
      throw error;
    }

    user.avatar = normalizedAvatar;
  }

  await user.save();

  return sanitizeUser(user);
};