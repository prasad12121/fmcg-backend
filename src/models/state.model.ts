import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
  {

    country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
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

export default mongoose.model("State", stateSchema);