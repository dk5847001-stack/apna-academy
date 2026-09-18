import crypto from "crypto";

const getKey = () => {
  const secret = String(
    process.env.REFERRAL_PAYOUT_DESTINATION_ENCRYPTION_KEY ||
      process.env.REFERRAL_PAYOUT_DESTINATION_HMAC_SECRET ||
      ""
  ).trim();

  if (!secret) {
    const error = new Error("Payout destination encryption is not configured.");
    error.statusCode = 503;
    error.code = "PAYOUT_DESTINATION_ENCRYPTION_NOT_CONFIGURED";
    throw error;
  }

  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptPayoutSecret = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
};

export const decryptPayoutSecret = (value) => {
  if (!value) return null;
  const [version, ivText, tagText, ciphertextText] = String(value).split(".");
  if (version !== "v1" || !ivText || !tagText || !ciphertextText) {
    throw new Error("Invalid encrypted payout secret.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivText, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};
