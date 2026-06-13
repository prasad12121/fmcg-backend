
import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice"
  },
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant"
  },
  quantity: Number,
  free_quantity: {
    type: Number,
    default: 0
  },
  price: Number,
  // GST % applied to this line (from the variant master) and the tax amount.
  gst_rate: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: Number
}, { timestamps: true, versionKey: false });

export default mongoose.model("InvoiceItem", invoiceItemSchema);