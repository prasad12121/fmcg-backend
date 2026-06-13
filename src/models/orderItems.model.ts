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

  // Total base units ordered (same as `quantity`); kept explicit for clarity.
  base_quantity:{
    type:Number,
    default:0
  },

  // Snapshot of the per-level packaging breakdown entered at order time.
  // `factor` preserves the conversion used then, so historical orders stay
  // reproducible even if the variant's UOM ladder changes later.
  uom_quantities:[
    {
      _id:false,
      name:{ type:String, trim:true },
      unit_qty:{ type:Number, default:0 },
      factor:{ type:Number, default:1 }
    }
  ],

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

  // GST % snapshot from the variant master at order time.
  gst_rate:{
    type:Number,
    default:0
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
