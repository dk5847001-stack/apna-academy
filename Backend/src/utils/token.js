import jwt from "jsonwebtoken";

export const generateAccessToken = (user, sessionId) => {
  if (!sessionId) {
    throw new Error("A session identifier is required to issue an access token.");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      sessionId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
