import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
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

      symbol: {
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

export default mongoose.model("Unit", unitSchema);
