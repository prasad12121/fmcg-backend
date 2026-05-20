import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema(
  {
    distributor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
    },

    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },

    type: {
      type: String,
      enum: [
        "stock_in",
        "order_dispatch",
        "delivery_confirmed",
        "sales_return",
        "sales_return_damaged",
        "purchase_return",
        "adjustment",
      ],
    },

    quantity: {
      type: Number,
      required: true,
    },

    reference_id: {
      type: String,
    },

    note: String,
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("StockLedger", stockLedgerSchema);
