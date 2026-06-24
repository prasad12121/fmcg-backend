/**
 * One-time migration: log counts of records without distributor_id per
 * collection, then set distributor_id = null where missing.
 *
 * Records with null distributor_id will be INVISIBLE to Distributor-role users
 * (their queries filter by their own id) but VISIBLE to SuperAdmin (no filter).
 * SuperAdmin can then assign them to the correct distributor via the UI.
 *
 * Run from the backend folder:
 *   npx ts-node scripts/backfillDistributorId.ts
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
if (!MONGO_URI) {
  console.error("❌  MONGO_URI not set in .env");
  process.exit(1);
}

const COLLECTIONS = [
  "brands",
  "categories",
  "units",
  "areas",
  "products",
  "variants",
  "beats",
  "vehicles",
  "schemes",
  "stocks",
  "payments",
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB\n");

  const db = mongoose.connection.db;
  let totalMissing = 0;
  const summary: { collection: string; missing: number; updated: number }[] = [];

  for (const coll of COLLECTIONS) {
    const collection = db.collection(coll);

    // Count docs without distributor_id (field absent OR null)
    const missingCount = await collection.countDocuments({
      $or: [{ distributor_id: { $exists: false } }, { distributor_id: null }],
    });

    let updatedCount = 0;

    if (missingCount > 0) {
      // Set distributor_id = null where the field is entirely absent
      const result = await collection.updateMany(
        { distributor_id: { $exists: false } },
        { $set: { distributor_id: null } }
      );
      updatedCount = result.modifiedCount;
    }

    totalMissing += missingCount;
    summary.push({ collection: coll, missing: missingCount, updated: updatedCount });
  }

  console.log("📊  Backfill Summary");
  console.log("─".repeat(52));
  console.log(
    "Collection".padEnd(20) +
    "Missing".padEnd(12) +
    "Field-added"
  );
  console.log("─".repeat(52));

  for (const row of summary) {
    console.log(
      row.collection.padEnd(20) +
      String(row.missing).padEnd(12) +
      row.updated
    );
  }

  console.log("─".repeat(52));
  console.log(`Total records without distributor_id: ${totalMissing}`);
  console.log();

  if (totalMissing > 0) {
    console.log("⚠️   These records now have distributor_id = null.");
    console.log("     They are visible ONLY to SuperAdmin.");
    console.log("     Assign them to a distributor via the Admin UI to make them accessible.");
  } else {
    console.log("🎉  All records already have distributor_id set.");
  }

  await mongoose.disconnect();
  console.log("\n✅  Done.");
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
