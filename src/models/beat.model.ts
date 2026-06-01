import mongoose from "mongoose";

const beatSchema = new mongoose.Schema(
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

        area_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Area",
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
    
       start_point: {
      type: String,
      default: "null",
    },

    end_point: {
      type: String,
      default: "null",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Beat = mongoose.model("Beat", beatSchema);
export default Beat;