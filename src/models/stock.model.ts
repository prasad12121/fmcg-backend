import mongoose from "mongoose";
const stockSchema = new mongoose.Schema(
  {
    distributor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
    },

    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },

    quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("Stock", stockSchema);
