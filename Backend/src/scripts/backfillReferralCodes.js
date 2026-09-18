import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/User.js";
import { ensureReferralCode } from "../services/referral.service.js";

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({
    $or: [
      { referralCode: null },
      { referralCode: { $exists: false } },
      { referralCode: "" },
    ],
  }).select("_id email");

  let assigned = 0;

  for (const user of users) {
    await ensureReferralCode(user._id);
    assigned += 1;
  }

  const remaining = await User.countDocuments({
    $or: [
      { referralCode: null },
      { referralCode: { $exists: false } },
      { referralCode: "" },
    ],
  });

  console.log(`Referral code backfill complete: ${assigned} assigned, ${remaining} remaining.`);
};

run()
  .catch((error) => {
    console.error("Referral code backfill failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
