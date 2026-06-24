import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicle_number: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_type: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_chassis_number: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_fuel_type: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "busy", "maintenance"],
      default: "available",
    },
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    distributor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Vehicle number unique per distributor
vehicleSchema.index({ vehicle_number: 1, distributor_id: 1 }, { unique: true });

export default mongoose.model("Vehicle", vehicleSchema);
