import mongoose from "mongoose";
const orderStatusHistorySchema = new mongoose.Schema({

  order_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },

  status:{
    type:String
  },

  updated_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  note:String

},{timestamps:true, versionKey:false});

export default mongoose.model("OrderStatusHistory", orderStatusHistorySchema);