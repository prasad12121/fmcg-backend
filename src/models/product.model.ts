import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },

  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["active","inactive"],
    default: "active"
  }

},
{ timestamps:true, versionKey:false }
);

export default mongoose.model("Product", productSchema);