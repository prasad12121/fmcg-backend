import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {

    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State",
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

export default mongoose.model("City", citySchema);