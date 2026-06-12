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

    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    hsn_code: {
      type: String,
      trim: true,
      default: "",
    },

    gst_rate: {
      type: Number,
      default: 0,
    },

    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    // Packaging / UOM hierarchy (e.g. Packet -> Patti -> Box).
    // The base level has is_base=true and factor=1; every higher level stores
    // `conversion` (units per parent step) and `factor` (cumulative base units).
    uom_levels: [
      {
        _id: false,
        name: { type: String, trim: true },
        unit_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
        },
        conversion: { type: Number, default: 1 },
        factor: { type: Number, default: 1 },
        is_base: { type: Boolean, default: false },
      },
    ],

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