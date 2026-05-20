import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema(
{
  order_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },

  variant_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Variant"
  },

  quantity:{
    type:Number,
    required:true
  },

  free_quantity:{
    type:Number,
    default:0
  },

  price:{
    type:Number
  },

  discount:{
    type:Number
  },

  tax:{
    type:Number
  },

  total:{
    type:Number
  }

},
{timestamps:true, versionKey:false}
);

export default mongoose.model("OrderItem", orderItemSchema);
