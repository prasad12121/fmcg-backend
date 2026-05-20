import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },


      country_code: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

        currency_code: {
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

export default mongoose.model("Country", countrySchema);
