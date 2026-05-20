import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
{
  order_number: {
    type: String,
    required: true
  },

  outlet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outlet",
    required: true
  },

    distributor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Distributor",
    required: true
  },

  order_date: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "invoiced",
      "dispatched",
      "delivered",
      "cancelled",
      "available",
      "out_of_stock"
    ],
    default: "pending"
  },

  subtotal: Number,
  gst: Number,
  total_discount: Number,
  total_tax: Number,
  grand_total: Number

},
{ timestamps: true, versionKey: false }
);

export default mongoose.model("Order", orderSchema);