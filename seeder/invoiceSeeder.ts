import mongoose from "mongoose";
import Invoice from "../src/models/invoice.model";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seedInvoices = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Invoice.deleteMany();

    await Invoice.insertMany([
      { invoice_number: "INV12345", order_id: "69b1676e15421c6a9bb4d0a0", outlet_id: "69b1676e15421c6a9bb4d0a0", total_amount: 1000, tax: 100, grand_total: 1100 },
      { invoice_number: "INV12346", order_id: "69b1676e15421c6a9bb4d0a0", outlet_id: "69b1676e15421c6a9bb4d0a0", total_amount: 500, tax: 50, grand_total: 550 },
      { invoice_number: "INV12347", order_id: "69b1676e15421c6a9bb4d0a0", outlet_id: "69b1676e15421c6a9bb4d0a0", total_amount: 800, tax: 80, grand_total: 880 },
      { invoice_number: "INV12348", order_id: "69b1676e15421c6a9bb4d0a0", outlet_id: "69b1676e15421c6a9bb4d0a0", total_amount: 1200, tax: 120, grand_total: 1320 },
      { invoice_number: "INV12349", order_id: "69b1676e15421c6a9bb4d0a0", outlet_id: "69b1676e15421c6a9bb4d0a0", total_amount: 1500, tax: 150, grand_total: 1650 }
    ]);

    console.log("Invoices Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedInvoices();