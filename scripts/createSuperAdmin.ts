/**
 * Seed script — creates the SuperAdmin user in MongoDB.
 *
 * Run from the backend folder:
 *   npx ts-node scripts/createSuperAdmin.ts
 *
 * Or compile first:
 *   npx tsc scripts/createSuperAdmin.ts --outDir dist/scripts --esModuleInterop
 *   node dist/scripts/createSuperAdmin.js
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  console.error("❌  MONGO_URI is not set in .env");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["SuperAdmin", "Distributor", "outlet"],
      default: "outlet",
    },
    distributor_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    isVerified: { type: Boolean, default: false },
    authCode: { type: String, default: null },
    authCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

async function main() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected");

  const email = "admin@fmcg.com";
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`⚠️   User already exists — email: ${existing.email} | role: ${existing.role}`);
    // If it exists but isn't SuperAdmin yet, upgrade it
    if (existing.role !== "SuperAdmin") {
      await User.findByIdAndUpdate(existing._id, { role: "SuperAdmin", isVerified: true });
      console.log("✅  Role updated to SuperAdmin");
    }
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 12);

  const user = await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "SuperAdmin",
    isVerified: true,
    distributor_id: null,
  });

  console.log("🎉  SuperAdmin created successfully!");
  console.log(`    ID    : ${user._id}`);
  console.log(`    Name  : ${user.name}`);
  console.log(`    Email : ${user.email}`);
  console.log(`    Role  : ${user.role}`);

  await mongoose.disconnect();
  console.log("🔌  Disconnected");
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
