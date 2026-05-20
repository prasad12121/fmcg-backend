import mongoose from "mongoose";
import orderModel from "../src/models/order.model";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seedOrder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await orderModel.deleteMany();

    await orderModel.insertMany([
      { _id: "69b9371653fa677e0a8633d5",order_number: "ORD12345", outlet_id: "69b1676e15421c6a9bb4d09e", distributor_id: "69afaf5df584472a73e89b77",subtotal:1000,gst:18,total_discount:100,total_tax:100,grand_total:1100},
      { _id: "69b93aab474e6dd922f2083d",order_number: "ORD12346", outlet_id: "69b1676e15421c6a9bb4d09e", distributor_id: "69afaf5df584472a73e89b77",subtotal:800,gst:18,total_discount:80,total_tax:80,grand_total:880},
      { _id: "69b93a94474e6dd922f20833",order_number: "ORD12347", outlet_id: "69b1676e15421c6a9bb4d09e", distributor_id: "69afaf5df584472a73e89b77",subtotal:1200,gst:18,total_discount:120,total_tax:120,grand_total:1320},
      { _id: "69cd0770b75e6c75afcc6c40",order_number: "ORD12348", outlet_id: "69b1676e15421c6a9bb4d09e", distributor_id: "69afaf5df584472a73e89b77",subtotal:1500,gst:18,total_discount:150,total_tax:150,grand_total:1650},
      { _id: "69d25cfc6bcf6b32c2619303",order_number: "ORD12349", outlet_id: "69b1676e15421c6a9bb4d09e", distributor_id: "69afaf5df584472a73e89b77",subtotal:1500,gst:18,total_discount:150,total_tax:150,grand_total:1650}
    ]);

    console.log("Orders Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedOrder();