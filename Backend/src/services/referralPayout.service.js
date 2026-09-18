import crypto from "crypto";
import ReferralWallet from "../models/ReferralWallet.js";
import ReferralPayout from "../models/ReferralPayout.js";
import ReferralReward from "../models/ReferralReward.js";
import ReferralLedger from "../models/ReferralLedger.js";
import { evaluateReferralWithdrawalRisk, recordReferralRiskEvent } from "./referralRisk.service.js";

const envPaise=(name,fallback)=>{const n=Number(process.env[name]);return Number.isSafeInteger(n)&&n>0?n:fallback;};
const MIN_WITHDRAWAL_PAISE=envPaise("REFERRAL_MIN_WITHDRAWAL_PAISE",19900);
const MAX_WITHDRAWAL_PAISE=envPaise("REFERRAL_MAX_WITHDRAWAL_PAISE",10000000);
const fail=(message,statusCode=400,code="REFERRAL_WITHDRAWAL_ERROR")=>Object.assign(new Error(message),{statusCode,code});
const validUpi=v=>/^[a-zA-Z0-9._-]{2,100}@[a-zA-Z]{2,64}$/.test(String(v||"").trim());
const validIfsc=v=>/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(v||"").trim().toUpperCase());
const validName=v=>/^[A-Za-z][A-Za-z .'-]{1,119}$/.test(String(v||"").trim());
const normalize=({method,upiId,accountHolderName,accountNumber,ifsc})=>{
 const m=String(method||"").trim().toLowerCase(), n=String(accountHolderName||"").trim().replace(/\s+/g," ");
 if(!["upi","bank"].includes(m))throw fail("Invalid payout method.");
 if(!validName(n))throw fail("Invalid account holder name.");
 if(m==="upi"){const u=String(upiId||"").trim();if(!validUpi(u))throw fail("Invalid UPI ID.");return{method:m,accountHolderName:n,upiId:u.toLowerCase()};}
 const a=String(accountNumber||"").replace(/\s+/g,""), i=String(ifsc||"").trim().toUpperCase();
 if(!/^[0-9]{9,18}$/.test(a))throw fail("Invalid bank account number.");
 if(!validIfsc(i))throw fail("Invalid IFSC code.");
 return{method:m,accountHolderName:n,accountNumberLast4:a.slice(-4),ifsc:i};
};
export const requestReferralWithdrawal=async({userId,...input})=>{
 const d=normalize(input);
 const risk = await evaluateReferralWithdrawalRisk({
  userId,
  destination: d,
  amountPaise: null,
 });
 if (!risk.allowed) {
  await recordReferralRiskEvent({
   userId,
   type: "manual_review",
   riskScore: risk.riskScore,
   signals: risk.signals,
   correlationId: risk.correlationId,
   status: "open",
  });
  throw fail("Withdrawal requires security review before it can be submitted.", 403, "WITHDRAWAL_RISK_BLOCKED");
 }
 const s=await ReferralWallet.startSession();
 try{let out;await s.withTransaction(async()=>{
  const w=await ReferralWallet.findOne({user:userId}).session(s);if(!w)throw fail("Referral wallet not found.",404,"WALLET_NOT_FOUND");
  const active=await ReferralPayout.findOne({user:userId,status:{$in:["requested","under_review","approved","processing"]}}).session(s);
  if(active)throw fail("An existing withdrawal is already in progress.",409,"WITHDRAWAL_ALREADY_PENDING");
  const amount=w.availableBalancePaise;
  if(amount<MIN_WITHDRAWAL_PAISE)throw fail("Available balance is below the minimum withdrawal amount.",400,"MIN_WITHDRAWAL_NOT_REACHED");
  if(amount>MAX_WITHDRAWAL_PAISE)throw fail("Available balance exceeds the configured withdrawal limit.",400,"WITHDRAWAL_LIMIT_EXCEEDED");
  const now=new Date();
  const finalRisk = await evaluateReferralWithdrawalRisk({ userId, destination: d, amountPaise: amount });
  if (!finalRisk.allowed) {
   await recordReferralRiskEvent({
    userId,
    type: "manual_review",
    riskScore: finalRisk.riskScore,
    signals: finalRisk.signals,
    correlationId: finalRisk.correlationId,
    status: "open",
   });
   throw fail("Withdrawal requires security review before it can be submitted.", 403, "WITHDRAWAL_RISK_BLOCKED");
  }
  const payout=(await ReferralPayout.create([{user:userId,amountPaise:amount,currency:"INR",status:finalRisk.requiresReview?"under_review":"requested",payoutMethod:d.method,destinationSnapshot:{method:d.method,accountHolderName:d.accountHolderName,...(d.method==="upi"?{upiId:d.upiId}:{accountNumberLast4:d.accountNumberLast4,ifsc:d.ifsc})},requestedAt:now,idempotencyKey:"withdrawal:"+userId+":"+crypto.randomUUID()}],{session:s}))[0];
  const updated=await ReferralWallet.findOneAndUpdate({_id:w._id,version:w.version,availableBalancePaise:{$gte:amount}},{$inc:{availableBalancePaise:-amount,lockedBalancePaise:amount,version:1},$set:{lastTransactionAt:now}},{new:true,session:s});
  if(!updated)throw fail("Wallet changed during withdrawal. Please retry.",409,"WALLET_CONFLICT");
  await ReferralReward.updateMany({referrer:userId,status:"available"},{$set:{status:"withdrawal_locked"}},{session:s});
  await ReferralLedger.create([{wallet:updated._id,user:userId,payout:payout._id,type:"withdrawal_lock",direction:"debit",amountPaise:amount,currency:"INR",balanceAfter:{totalEarnedPaise:updated.totalEarnedPaise,availableBalancePaise:updated.availableBalancePaise,pendingBalancePaise:updated.pendingBalancePaise,lockedBalancePaise:updated.lockedBalancePaise,paidOutPaise:updated.paidOutPaise,reversedPaise:updated.reversedPaise},idempotencyKey:"withdrawal_lock:"+payout._id,description:"Available referral balance locked for withdrawal request.",metadata:{payoutId:String(payout._id)}}],{session:s});
  out=payout;
 });return out;}finally{await s.endSession();}
};
export const listMyReferralPayouts=async userId=>ReferralPayout.find({user:userId}).sort({createdAt:-1}).limit(50).select("_id amountPaise currency status payoutMethod destinationSnapshot requestedAt approvedAt processedAt failedAt failureReason rejectionReason reversedAt createdAt").lean();