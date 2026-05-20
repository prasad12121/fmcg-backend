import mongoose from "mongoose";

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

// ─── ✅ Define sub-schema FIRST, as a plain new Schema() ─────────────────────
//     Do NOT call mongoose.model() on this — it must stay as a Schema only
const returnItemSchema = new Schema(
  {
    dispatch_item_id: {
      type: ObjectId,
      ref: "DispatchItem",
      required: true,
    },
    variant_id: {
      type: ObjectId,
      ref: "Variant",
      required: true,
    },
    delivered_qty: {
      type: Number,
      default: 0,
    },
    return_qty: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      default: 0,
    },
    total_price: {
      type: Number,
      default: 0,
    },
    return_type: {
      type: String,
      enum: ["good", "damaged", "expired", "short_expiry", "wrong_product"],
      default: "good",
    },
    remark: {
      type: String,
      default: "",
    },
  },
  { _id: false }   // ← no separate _id for sub-documents
);

// ─── ✅ Timeline sub-schema ───────────────────────────────────────────────────
const timelineSchema = new Schema(
  {
    status: { type: String, required: true },
    changed_by: { type: ObjectId, ref: "User" },
    changed_by_role: {
      type: String,
      enum: ["outlet", "distributor", "system"],
      default: "system",
    },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── ✅ Main schema — uses the Schema objects above, NOT model instances ──────

const returnSchema = new Schema(
  {
    dispatch_id: {
      type: ObjectId,
      ref: "Dispatch",
      required: true,
    },
    order_id: {
      type: ObjectId,
      ref: "Order",
      required: true,
    },
    invoice_id: {
      type: ObjectId,
      ref: "Invoice",
    },
    outlet_id: {
      type: ObjectId,
      ref: "Outlet",
      required: true,
    },
    return_number: {
      type: String,
      required: true,
      unique: true,
    },
    return_date: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "processed", "cancelled"],
      default: "pending",
    },

    // ✅ Correct — array of Schema, NOT array of Model
    return_items: {
      type: [returnItemSchema],
      default: [],
    },

    timeline: {
      type: [timelineSchema],
      default: [],
    },

    total_return_amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

// ─── Pre-save hook (Mongoose 9+: no next() callback) ───────────────────────────
returnSchema.pre("save", function () {
  if (this.return_items?.length) {
    this.return_items.forEach((item) => {
      item.total_price = item.return_qty * item.unit_price;
    });
    this.total_return_amount = this.return_items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
returnSchema.index({ dispatch_id: 1 });
returnSchema.index({ outlet_id: 1, status: 1 });

export default mongoose.model("Return", returnSchema);