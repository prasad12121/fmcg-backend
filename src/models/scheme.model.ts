import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["BUY_X_GET_Y", "QUANTITY_DISCOUNT", "VALUE_DISCOUNT"],
      required: true,
    },
    start_date: Date,
    end_date: Date,
    distributor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true, versionKey: false }
);

// Scheme name unique per distributor — different distributors may share the same name
schemeSchema.index({ name: 1, distributor_id: 1 }, { unique: true });

export default mongoose.model("Scheme", schemeSchema);
