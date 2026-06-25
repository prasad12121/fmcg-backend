/**
 * fixIndexes.ts
 *
 * Drops stale global unique indexes left over from before distributor_id was
 * added to the multi-tenant schema.  When the models originally shipped they
 * had simple `unique: true` on individual fields (e.g. `name`).  Phase 1
 * replaced those with compound indexes that include `distributor_id`, but
 * MongoDB keeps the old indexes alive unless they are explicitly dropped.
 *
 * Both the old global index AND the new compound index are enforced at the
 * same time, which means Distributor B cannot create a record with the same
 * name as one already owned by Distributor A — even though their compound
 * keys are completely different.
 *
 * This function is idempotent: if an index no longer exists it is silently
 * skipped.  It should be called once after every successful DB connection.
 *
 * Collections / stale indexes handled:
 *   brands      { name: 1 }
 *   categories  { name: 1 }
 *   units       { name: 1 }  { symbol: 1 }
 *   variants    { sku_code: 1 }
 *   areas       { name: 1 }  { name: 1, city_id: 1 }
 */

import mongoose from "mongoose";

type IndexKey = Record<string, unknown>;

/**
 * Drops every index on `collection` whose key matches `targetKey` exactly.
 * The _id index is always skipped.
 */
async function dropIfExists(
  collection: mongoose.mongo.Collection,
  targetKey: IndexKey
): Promise<void> {
  const target = JSON.stringify(targetKey);

  let indexes: Array<{ name: string; key: IndexKey }> = [];
  try {
    indexes = await collection.indexes() as Array<{ name: string; key: IndexKey }>;
  } catch {
    return; // collection may not exist yet
  }

  for (const idx of indexes) {
    if (idx.name === "_id_") continue;
    if (JSON.stringify(idx.key) === target) {
      try {
        await collection.dropIndex(idx.name);
        console.log(
          `[fixIndexes] Dropped stale index "${idx.name}" on ${collection.collectionName}`
        );
      } catch (err: any) {
        // 27 = IndexNotFound — race condition, already gone
        if (err?.code !== 27) {
          console.error(
            `[fixIndexes] Could not drop index "${idx.name}" on ` +
            `${collection.collectionName}: ${err?.message}`
          );
        }
      }
    }
  }
}

export async function fixIndexes(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) {
    console.warn("[fixIndexes] No DB connection — skipping index cleanup.");
    return;
  }

  // ── brands ────────────────────────────────────────────────────────────────
  // Old: { name: 1 } unique
  // New: { name: 1, distributor_id: 1 } unique
  const brands = db.collection("brands");
  await dropIfExists(brands, { name: 1 });

  // ── categories ────────────────────────────────────────────────────────────
  // Old: { name: 1 } unique
  // New: { name: 1, distributor_id: 1 } unique
  const categories = db.collection("categories");
  await dropIfExists(categories, { name: 1 });

  // ── units ─────────────────────────────────────────────────────────────────
  // Old: { name: 1 } unique  AND  { symbol: 1 } unique
  // New: { name: 1, distributor_id: 1 } unique
  //      { symbol: 1, distributor_id: 1 } unique
  const units = db.collection("units");
  await dropIfExists(units, { name: 1 });
  await dropIfExists(units, { symbol: 1 });

  // ── variants ──────────────────────────────────────────────────────────────
  // Old: { sku_code: 1 } unique
  // New: { sku_code: 1, distributor_id: 1 } unique
  const variants = db.collection("variants");
  await dropIfExists(variants, { sku_code: 1 });

  // ── areas ─────────────────────────────────────────────────────────────────
  // Old possibilities: { name: 1 } unique  OR  { name: 1, city_id: 1 } unique
  // New: { name: 1, city_id: 1, distributor_id: 1 } unique
  const areas = db.collection("areas");
  await dropIfExists(areas, { name: 1 });
  await dropIfExists(areas, { name: 1, city_id: 1 });

  console.log("[fixIndexes] Index cleanup complete.");
}
