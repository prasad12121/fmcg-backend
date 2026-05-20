import mongoose from "mongoose";
const stockMovementSchema = new mongoose.Schema(
  {
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },

    type: {
      type: String,
      enum: ["stock_in", "order_dispatch", "return"],
    },

    quantity: Number,

    reference_id: String,
  },
  { timestamps: true, versionKey: false },
);

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
export default StockMovement;
