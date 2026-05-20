import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    payment_number: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    outlet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    payment_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    payment_mode: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "cheque"],
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
      min: 0.01,
    },
    reference_number: {
      type: String,
      trim: true,
      default: "",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "overdue"],
      default: "unpaid",
    },
    invoice_total: {
      type: Number,
      default: 0,
      min: 0,
      
    },
    total_paid: {
      type: Number,
      default: 0,
      min: 0,
    },
    due_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Payment", paymentSchema);

