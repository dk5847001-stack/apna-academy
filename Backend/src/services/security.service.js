import crypto from "crypto";

import SecurityEvent from "../models/SecurityEvent.js";
import Notification from "../models/Notification.js";

const SECURITY_HASH_SALT =
  process.env.SECURITY_EVENT_HASH_SALT || process.env.JWT_SECRET || "";

const hashSecurityValue = (value) => {
  if (!value || !SECURITY_HASH_SALT) return null;
  return crypto
    .createHash("sha256")
    .update(`${SECURITY_HASH_SALT}:${value}`)
    .digest("hex");
};

export const recordConcurrentLoginEvent = async ({
  userId,
  detectionNumber,
  previousSessionIssuedAt,
  newSessionIssuedAt,
  ipAddress,
  userAgent,
  source,
  correlationId,
}) => {
  if (!userId || !detectionNumber || !newSessionIssuedAt || !correlationId) {
    return null;
  }

  try {
    return await SecurityEvent.create({
      user: userId,
      type: "concurrent-login",
      detectionNumber,
      detectedAt: newSessionIssuedAt,
      previousSessionIssuedAt: previousSessionIssuedAt || null,
      newSessionIssuedAt,
      ipHash: hashSecurityValue(ipAddress),
      userAgentHash: hashSecurityValue(userAgent),
      source,
      correlationId,
    });
  } catch (error) {
    /*
     * The session transition remains authoritative in User. Audit persistence
     * must never turn a valid login into a failed login, but duplicate
     * correlation IDs are safely ignored because the event is idempotent.
     */
    if (error?.code === 11000) return null;
    throw error;
  }
};


export const createConcurrentLoginNotification = async ({
  userId,
  detectionNumber,
  detectionLimit = 5,
}) => {
  if (!userId || !detectionNumber) return null;

  try {
    return await Notification.create({
      user: userId,
      title: "Security alert: new login detected",
      message:
        `Your account was signed in while another session was already active. This session was securely replaced. Detection ${detectionNumber}/${detectionLimit}.`,
      type: "system",
      link: "/profile",
      isRead: false,
    });
  } catch (error) {
    console.error("Concurrent login security notification failed:", error);
    return null;
  }
};
