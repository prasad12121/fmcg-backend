import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku_code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    pack_size: {
      type: String,
      trim: true,
    },

    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    weight: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Variant", variantSchema);