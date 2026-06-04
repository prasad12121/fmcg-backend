import mongoose from "mongoose";

const dispatchItemSchema = new mongoose.Schema(
  {
    dispatch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispatch",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    outlet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    ordered_qty: {
      type: Number,
      default: 0,
    },
    dispatched_qty: {
      type: Number,
      default: 0,
    },
    delivered_qty: {
      type: Number,
      default: 0,
    },
    short_qty: {
      type: Number,
      default: 0,
    },
    returned_qty: {
      type: Number,
      default: 0,
    },
    free_qty: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "dispatched", "partially_delivered", "delivered", "returned"],
      default: "pending",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("DispatchItem", dispatchItemSchema);
