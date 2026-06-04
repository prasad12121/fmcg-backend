import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema(
  {
    // A single delivery can group orders from multiple outlets, so order/outlet
    // are tracked per dispatch item rather than on the dispatch itself.
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    dispatch_date: {
      type: Date,
      default: Date.now,
    },
    delivered_date: {
      type: Date,
    },
    vehicle_number: {
      type: String,
      required: true,
    },
    driver_name: {
      type: String,
      required: true,
    },
    receiver_name: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    beat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Beat",
    },
    outlet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
    status: {
      type: String,
      enum: ["pending", "dispatched", "partially_delivered", "delivered", "returned"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Dispatch", dispatchSchema);
