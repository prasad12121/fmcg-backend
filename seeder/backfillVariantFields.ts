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
 * It also defaults the new order/invoice line fields (gst_rate, base_quantity,
 * uom_quantities) so legacy orders/invoices render without errors. Note: per the
 * agreed rollout, legacy orders keep their original totals; this only fills the
 * structural defaults, it does not recompute historical tax.
 *
 * Run with:  npm run migrate:variantFields
 */
import "dotenv/config";
import mongoose from "mongoose";
import VariantModel from "../src/models/variant.model";
import ProductPriceModel from "../src/models/productPrice.model";
import OrderItemModel from "../src/models/orderItems.model";
import InvoiceItemModel from "../src/models/invoiceItems.model";

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

    // Order lines: default base_quantity to the existing base quantity, plus
    // empty packaging breakdown and gst_rate. Note these are two passes because
    // base_quantity is copied from `quantity` (an aggregation update).
    const orderItemStructResult = await OrderItemModel.updateMany(
      {
        $or: [
          { uom_quantities: { $exists: false } },
          { gst_rate: { $exists: false } },
        ],
      },
      { $set: { uom_quantities: [], gst_rate: 0 } }
    );
    const orderItemBaseQtyResult = await OrderItemModel.updateMany(
      { base_quantity: { $exists: false } },
      [{ $set: { base_quantity: "$quantity" } }]
    );
    console.log(
      `OrderItems backfilled: struct modified=${orderItemStructResult.modifiedCount}, base_quantity modified=${orderItemBaseQtyResult.modifiedCount}`
    );

    const invoiceItemResult = await InvoiceItemModel.updateMany(
      {
        $or: [
          { gst_rate: { $exists: false } },
          { tax: { $exists: false } },
        ],
      },
      { $set: { gst_rate: 0, tax: 0 } }
    );
    console.log(
      `InvoiceItems backfilled: matched=${invoiceItemResult.matchedCount}, modified=${invoiceItemResult.modifiedCount}`
    );

    console.log("Variant + order/invoice field backfill complete ✅");
    process.exit(0);
  } catch (error) {
    console.error("Backfill error:", error);
    process.exit(1);
  }
};

backfill();
