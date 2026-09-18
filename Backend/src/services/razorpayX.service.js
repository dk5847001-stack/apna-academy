import crypto from "crypto";
import { getRazorpayXConfig } from "../config/razorpayX.js";

const API_BASE_URL = "https://api.razorpay.com/v1";

const providerError = ({ status, code, reason, description, source = "provider", retryable = false }) => {
  const error = new Error(retryable ? "RazorpayX request could not be completed safely. The payout remains recoverable." : "RazorpayX rejected the request.");
  error.statusCode = retryable ? 503 : status >= 400 && status < 500 ? 502 : 503;
  error.code = code || "RAZORPAYX_PROVIDER_ERROR";
  error.providerStatus = status;
  error.providerReason = reason || null;
  error.providerDescription = description || null;
  error.providerSource = source;
  error.retryable = retryable;
  error.isRazorpayXError = true;
  return error;
};

const requestJson = async (path, { method = "GET", body, headers = {}, timeoutMs } = {}) => {
  const config = getRazorpayXConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs || config.timeoutMs);
  const auth = Buffer.from(config.keyId + ":" + config.keySecret).toString("base64");
  try {
    const response = await fetch(API_BASE_URL + path, {
      method,
      signal: controller.signal,
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Basic " + auth, ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!response.ok) {
      const apiError = data?.error || {};
      throw providerError({ status: response.status, code: apiError.code, reason: apiError.reason, description: apiError.description, source: apiError.source, retryable: response.status >= 500 });
    }
    return data || {};
  } catch (error) {
    if (error?.name === "AbortError") throw providerError({ status: 504, code: "RAZORPAYX_TIMEOUT", retryable: true });
    if (error?.isRazorpayXError || error?.code?.startsWith?.("RAZORPAYX_")) throw error;
    throw providerError({ status: 503, code: "RAZORPAYX_NETWORK_ERROR", retryable: true });
  } finally { clearTimeout(timeout); }
};

const normalizeProviderPayout = (data = {}) => {
  const statusDetails = data.status_details || {};
  return {
    providerPayoutId: data.id || null,
    providerFundAccountId: data.fund_account_id || null,
    providerStatus: data.status || null,
    providerReferenceId: data.reference_id || null,
    providerUtr: data.utr || null,
    providerFailureReason: data.failure_reason || statusDetails.description || statusDetails.reason || data.error?.description || null,
    providerFailureCode: data.error?.reason || statusDetails.reason || null,
    amountPaise: Number.isSafeInteger(Number(data.amount)) ? Number(data.amount) : null,
    currency: data.currency || null,
    mode: data.mode || null,
  };
};

export const createContact = async ({ name, email, phone, referenceId }) => {
  const body = { name, type: "customer", reference_id: referenceId };
  if (email) body.email = email;
  if (phone) body.contact = phone;
  const data = await requestJson("/contacts", { method: "POST", body });
  return { providerContactId: data.id || null, active: data.active !== false };
};

export const createFundAccount = async ({ providerContactId, method, accountHolderName, accountNumber, ifsc, upiId }) => {
  const body = method === "upi"
    ? { contact_id: providerContactId, account_type: "vpa", vpa: { address: upiId } }
    : { contact_id: providerContactId, account_type: "bank_account", bank_account: { name: accountHolderName, ifsc, account_number: accountNumber } };
  const data = await requestJson("/fund_accounts", { method: "POST", body });
  if (!data.id) throw providerError({ status: 502, code: "RAZORPAYX_FUND_ACCOUNT_MISSING", retryable: true });
  return { providerFundAccountId: data.id, active: data.active !== false };
};

export const ensureFundAccount = async ({ user, destination, providerContactId = null, providerFundAccountId = null }) => {
  if (providerFundAccountId) return { providerContactId, providerFundAccountId, active: true };
  const contact = providerContactId ? { providerContactId } : await createContact({ name: destination.accountHolderName, email: user.email, phone: user.phone, referenceId: ("apna_user_" + String(user._id)).slice(0, 40) });
  const fundAccount = await createFundAccount({ providerContactId: contact.providerContactId, method: destination.method, accountHolderName: destination.accountHolderName, accountNumber: destination.accountNumber, ifsc: destination.ifsc, upiId: destination.upiId });
  return { providerContactId: contact.providerContactId, providerFundAccountId: fundAccount.providerFundAccountId, active: fundAccount.active };
};

export const createPayout = async ({ amountPaise, currency, providerFundAccountId, payoutMethod, referenceId, idempotencyKey }) => {
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) { const error = new Error("Invalid RazorpayX payout amount."); error.statusCode = 400; error.code = "RAZORPAYX_INVALID_AMOUNT"; throw error; }
  if (currency !== "INR") { const error = new Error("Only INR payouts are supported."); error.statusCode = 400; error.code = "RAZORPAYX_INVALID_CURRENCY"; throw error; }
  const mode = payoutMethod === "upi" ? "UPI" : "IMPS";
  const data = await requestJson("/payouts", {
    method: "POST",
    headers: { "X-Payout-Idempotency": idempotencyKey },
    body: { account_number: getRazorpayXConfig().accountNumber, fund_account_id: providerFundAccountId, amount: amountPaise, currency: "INR", mode, purpose: "payout", queue_if_low_balance: true, reference_id: String(referenceId).slice(0, 40), narration: "ApnaAcademy Referral" },
  });
  return normalizeProviderPayout(data);
};

export const fetchPayout = async (providerPayoutId) => normalizeProviderPayout(await requestJson("/payouts/" + encodeURIComponent(providerPayoutId)));

export const fetchPayoutByReference = async (referenceId) => {
  const config = getRazorpayXConfig();
  const data = await requestJson("/payouts?account_number=" + encodeURIComponent(config.accountNumber) + "&reference_id=" + encodeURIComponent(referenceId) + "&count=10");
  return (Array.isArray(data?.items) ? data.items : []).map(normalizeProviderPayout);
};

export const verifyWebhookSignature = ({ rawBody, signature }) => {
  const config = getRazorpayXConfig();
  if (!Buffer.isBuffer(rawBody) || !signature) return false;
  const expected = crypto.createHmac("sha256", config.webhookSecret).update(rawBody).digest("hex");
  const suppliedBuffer = Buffer.from(String(signature).trim(), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
};

export const sanitizeProviderError = (error) => ({ code: error?.code || "RAZORPAYX_ERROR", statusCode: error?.statusCode || 503, retryable: Boolean(error?.retryable), providerStatus: error?.providerStatus || null, providerReason: error?.providerReason || null });
