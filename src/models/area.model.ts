import mongoose from "mongoose";

const areaSchema = new mongoose.Schema(
  {
    country_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },

    state_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },

    city_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

export default mongoose.model("Area", areaSchema);
