/**
 * One-time backfill migration.
 *
 * Before the schema fix, the Variant and ProductPrice models did not define
 * `gst_rate`, `barcode`, `hsn_code`, `uom_levels` (Variant) or `cost_price`
 * (ProductPrice). Values sent for those fields were silently dropped by
 * Mongoose strict mode, so existing documents have no such keys at all.
 *
 * This script adds the missing keys with safe defaults so legacy records open
 * cleanly in the variant edit screen. It is idempotent — only documents that
 * are missing a field are touched.
 *
 * Run with:  npm run migrate:variantFields
 */
import "dotenv/config";
import mongoose from "mongoose";
import VariantModel from "../src/models/variant.model";
import ProductPriceModel from "../src/models/productPrice.model";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fmcg";

const backfill = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);

    const variantResult = await VariantModel.updateMany(
      {
        $or: [
          { gst_rate: { $exists: false } },
          { barcode: { $exists: false } },
          { hsn_code: { $exists: false } },
          { uom_levels: { $exists: false } },
        ],
      },
      {
        $set: {
          gst_rate: 0,
          barcode: "",
          hsn_code: "",
          uom_levels: [],
        },
      }
    );
    console.log(
      `Variants backfilled: matched=${variantResult.matchedCount}, modified=${variantResult.modifiedCount}`
    );

    const priceResult = await ProductPriceModel.updateMany(
      { cost_price: { $exists: false } },
      { $set: { cost_price: 0 } }
    );
    console.log(
      `ProductPrices backfilled: matched=${priceResult.matchedCount}, modified=${priceResult.modifiedCount}`
    );

    console.log("Variant field backfill complete ✅");
    process.exit(0);
  } catch (error) {
    console.error("Backfill error:", error);
    process.exit(1);
  }
};

backfill();
