import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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

// Compound unique: category name is unique per distributor
categorySchema.index({ name: 1, distributor_id: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
