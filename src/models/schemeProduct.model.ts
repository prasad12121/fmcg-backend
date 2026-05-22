import mongoose from "mongoose";

const schemeProductSchema = new mongoose.Schema({

  scheme_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Scheme"
  },

  variant_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Variant"
  },

  buy_qty:{
    type:Number
  },

  free_qty:{
    type:Number
  },

  discount_percent:{
    type:Number
  }

});

export default mongoose.model("SchemeProduct",schemeProductSchema);