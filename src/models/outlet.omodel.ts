import mongoose from "mongoose";

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    open_time: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    close_time: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    outlet_number: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    outlet_type: {
      type: String,
      enum: ["grocery", "bakery"],
      default: "grocery",
      required: true,
      trim: true,
    },

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

    area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },

    contact_person: {
      type: String,
      required: true,
      trim: true,
    },
    mobile_number1: {
      type: String,
      required: true,
      trim: true,
    },

    mobile_number2: {
      type: String,
      required: true,
      trim: true,
    },

    landline_number: {
      type: String,
      default: "null",
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    owner_name: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      default: "null",
    },

    address: {
      type: String,
      default: "null",
    },

    pan_number: {
      type: String,
      default: "null",
    },

    gst_number: {
      type: String,
      default: "null",
    },

    FSSAI_number: {
      type: String,
      default: "null",
    },

    creadit_limit: {
      type: Number,
      default: 0,
    },
    beat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beat",
      required: true,
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
  },
);

const Outlet = mongoose.model("Outlet", outletSchema);
export default Outlet;
