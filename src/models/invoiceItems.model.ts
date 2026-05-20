
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
  total: Number
}, { timestamps: true, versionKey: false });

export default mongoose.model("InvoiceItem", invoiceItemSchema);