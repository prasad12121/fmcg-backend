import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Za-z\s&-]+$/.test(v);
        },
      },
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
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
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique: name and symbol are unique per distributor
unitSchema.index({ name: 1, distributor_id: 1 }, { unique: true });
unitSchema.index({ symbol: 1, distributor_id: 1 }, { unique: true });

export default mongoose.model("Unit", unitSchema);
