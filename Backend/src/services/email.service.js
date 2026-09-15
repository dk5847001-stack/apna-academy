import nodemailer from "nodemailer";

const getEmailConfig = () => {
  const user = process.env.APP_EMAIL?.trim();
  const password = process.env.APP_PASSWORD?.trim();

  if (!user || !password) {
    const error = new Error(
      "Email service is not configured. Set APP_EMAIL and APP_PASSWORD in the backend environment."
    );
    error.statusCode = 503;
    throw error;
  }

  return { user, password };
};

const getFrontendPublicUrl = () => {
  const configuredUrl = process.env.FRONTEND_PUBLIC_URL?.trim();
  const fallbackUrl = process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:5173";
  const value = configuredUrl || fallbackUrl;

  if (!value) {
    const error = new Error(
      "Frontend public URL is not configured. Set FRONTEND_PUBLIC_URL in the backend environment."
    );
    error.statusCode = 503;
    throw error;
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("FRONTEND_PUBLIC_URL must use HTTP or HTTPS.");
    }

    return url.toString().replace(/\/+$/, "");
  } catch (error) {
    if (error.statusCode) throw error;

    const configError = new Error(
      "FRONTEND_PUBLIC_URL must be a valid HTTP or HTTPS URL."
    );
    configError.statusCode = 503;
    throw configError;
  }
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const { user, password } = getEmailConfig();

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass: password,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  return transporter;
};

export const sendEmailVerificationOtp = async ({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}) => {
  const { user } = getEmailConfig();
  const safeName = escapeHtml(String(name || "Student").trim() || "Student");

  await getTransporter().sendMail({
    from: `ApnaAcademy <${user}>`,
    to,
    subject: `${otp} is your ApnaAcademy verification code`,
    text: `Hi ${safeName},\n\nYour ApnaAcademy email verification code is ${otp}. It expires in ${expiresInMinutes} minutes.\n\nIf you did not request this, you can safely ignore this email.\n\nApnaAcademy`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff">
            <div style="font-size:20px;font-weight:800;letter-spacing:-.02em">ApnaAcademy</div>
            <div style="margin-top:6px;color:#bfdbfe;font-size:13px">Learn. Build. Grow.</div>
          </div>
          <div style="padding:34px 32px">
            <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700">Email verification</div>
            <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2">Verify your email</h1>
            <p style="margin:0;color:#64748b;font-size:15px;line-height:1.7">Hi ${safeName}, use the verification code below to finish creating your ApnaAcademy account.</p>
            <div style="margin:28px 0;padding:20px;text-align:center;border:1px solid #dbeafe;background:#f8fbff;border-radius:18px">
              <div style="font-size:34px;letter-spacing:10px;font-weight:900;color:#1d4ed8">${otp}</div>
              <div style="margin-top:8px;color:#64748b;font-size:12px">Expires in ${expiresInMinutes} minutes</div>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">Never share this code with anyone. If you did not request this verification, you can safely ignore this email.</p>
          </div>
          <div style="padding:18px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px">© ${new Date().getFullYear()} ApnaAcademy. All rights reserved.</div>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  token,
  expiresInMinutes = 15,
}) => {
  const { user } = getEmailConfig();
  const safeName = escapeHtml(String(name || "Student").trim() || "Student");
  const frontendUrl = getFrontendPublicUrl();
  const resetUrl = new URL("/reset-password", `${frontendUrl}/`);
  resetUrl.searchParams.set("token", token);
  const resetLink = resetUrl.toString();

  await getTransporter().sendMail({
    from: `ApnaAcademy <${user}>`,
    to,
    subject: "Reset your ApnaAcademy password",
    text: `Hi ${name || "Student"},\n\nWe received a request to reset your ApnaAcademy password. Use the link below to choose a new password:\n\n${resetLink}\n\nThis link expires in ${expiresInMinutes} minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.\n\nApnaAcademy`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08)">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff">
            <div style="font-size:20px;font-weight:800;letter-spacing:-.02em">ApnaAcademy</div>
            <div style="margin-top:6px;color:#bfdbfe;font-size:13px">Learn. Build. Grow.</div>
          </div>
          <div style="padding:34px 32px">
            <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700">Password recovery</div>
            <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2">Reset your password</h1>
            <p style="margin:0;color:#64748b;font-size:15px;line-height:1.7">Hi ${safeName}, we received a request to reset your ApnaAcademy password. Use the secure button below to choose a new password.</p>
            <div style="margin:28px 0;text-align:center">
              <a href="${escapeHtml(resetLink)}" style="display:inline-block;padding:14px 22px;border-radius:14px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800">Reset Password</a>
            </div>
            <div style="padding:16px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:16px;color:#64748b;font-size:12px;line-height:1.7;word-break:break-all">
              If the button does not work, open this link:<br />${escapeHtml(resetLink)}
            </div>
            <p style="margin:18px 0 0;color:#94a3b8;font-size:12px;line-height:1.6">This link expires in ${expiresInMinutes} minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          <div style="padding:18px 32px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px">© ${new Date().getFullYear()} ApnaAcademy. All rights reserved.</div>
        </div>
      </div>
    `,
  });
};
