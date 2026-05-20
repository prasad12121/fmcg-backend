import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema({

  invoice_number:{
    type:String,
    required:true
  },

  order_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Order"
  },

  outlet_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Outlet"
  },

  total_amount:Number,
  tax:Number,
  grand_total:Number,

  status:{
    type:String,
    enum:["generated","paid","cancelled"],
    default:"generated"
  }

},{timestamps:true, versionKey:false});

export default mongoose.model("Invoice", invoiceSchema);
