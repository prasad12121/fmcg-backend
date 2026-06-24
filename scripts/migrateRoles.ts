/**
 * One-time migration: normalise role values in the users collection.
 *
 *   "distributor" → "Distributor"
 *   "admin"       → "SuperAdmin"
 *   "outlet"      → stays "outlet"
 *
 * Run from the backend folder:
 *   npx ts-node scripts/migrateRoles.ts
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI not set in .env");
  process.exit(1);
}

async function main() {
  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected\n");

  const db = mongoose.connection.db!;
  const users = db.collection("users");

  // --- distributor → Distributor ---
  const dist = await users.updateMany(
    { role: "distributor" },
    { $set: { role: "Distributor" } }
  );
  console.log(`👤  distributor → Distributor : ${dist.modifiedCount} user(s) updated`);

  // --- admin → SuperAdmin ---
  const admin = await users.updateMany(
    { role: "admin" },
    { $set: { role: "SuperAdmin" } }
  );
  console.log(`👤  admin → SuperAdmin        : ${admin.modifiedCount} user(s) updated`);

  // --- summary ---
  const total = dist.modifiedCount + admin.modifiedCount;
  console.log(`\n✅  Migration complete — ${total} user(s) updated`);

  await mongoose.disconnect();
  console.log("🔌  Disconnected");
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
