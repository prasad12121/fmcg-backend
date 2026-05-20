import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate : {
        validator: function(v) {
          return /^[A-Za-z\s&-]+$/.test(v); // Only allows letters, numbers, and spaces
        },
      },
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

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;