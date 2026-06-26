/**
 * seedAdmin.ts — One-time script to create the initial SuperAdmin user.
 *
 * Usage (from the backend/ directory):
 *   npx ts-node -r dotenv/config src/utils/seedAdmin.ts
 *
 * Or via npm script:
 *   npm run seed:admin
 *
 * Credentials are read from environment variables (.env file):
 *   ADMIN_EMAIL    — required (e.g. admin@mycompany.com)
 *   ADMIN_PASSWORD — required (e.g. Admin@123)
 *   ADMIN_NAME     — optional (defaults to "Super Admin")
 *
 * The script is idempotent:
 *   - If a User with ADMIN_EMAIL already exists, it upgrades them to
 *     SuperAdmin + isVerified without touching the password.
 *   - If no User exists, it creates one with the given credentials.
 *   - Run it as many times as needed; it will not create duplicates.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model";

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";

async function seed() {
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI is not set in .env");
    process.exit(1);
  }
  if (!ADMIN_EMAIL) {
    console.error("❌  ADMIN_EMAIL is not set in .env");
    process.exit(1);
  }
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 6) {
    console.error("❌  ADMIN_PASSWORD is not set or is too short (min 6 chars)");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected.");

  const existing = await User.findOne({ email: ADMIN_EMAIL }).select("+passwordHash");

  if (existing) {
    // Upgrade to SuperAdmin + mark verified without changing password
    const wasAdmin = (existing as any).role === "SuperAdmin";
    await User.findByIdAndUpdate(existing._id, {
      role: "SuperAdmin",
      isVerified: true,
      distributor_id: null,
      outlet_id: null,
    });
    console.log(
      wasAdmin
        ? `ℹ️   SuperAdmin already exists for ${ADMIN_EMAIL} — re-verified and confirmed.`
        : `♻️   Existing user ${ADMIN_EMAIL} upgraded to SuperAdmin and marked verified.`
    );
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: "SuperAdmin",
      isVerified: true,
      distributor_id: null,
      outlet_id: null,
    });
    console.log(`✅  SuperAdmin created:`);
    console.log(`    Email   : ${ADMIN_EMAIL}`);
    console.log(`    Password: ${ADMIN_PASSWORD}`);
    console.log(`    Name    : ${ADMIN_NAME}`);
  }

  await mongoose.disconnect();
  console.log("🔌  Disconnected. Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
