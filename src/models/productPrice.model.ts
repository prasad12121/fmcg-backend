import mongoose from "mongoose";

const productPriceSchema = new mongoose.Schema({

  variant_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Variant",
    required:true
  },

  cost_price:{
    type:Number,
    default:0
  },

  mrp:{
    type:Number,
    required:true
  },

  distributor_price:{
    type:Number
  },

  retailer_price:{
    type:Number
  }

}
, { timestamps:true, versionKey:false }
);

export default mongoose.model("ProductPrice", productPriceSchema);