import mongoose from "mongoose";
import stockModel from "../src/models/stock.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedStocks = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await stockModel.deleteMany();

    await stockModel.insertMany([
      { distributor_id: "69afaf5df584472a73e89b77" ,variant_id: "69b4d90a5cba88ad9b64ff12", quantity: 500 },
      { distributor_id: "69afaf5df584472a73e89b77" ,variant_id: "69b4d90a5cba88ad9b64ff13", quantity: 500 },
      { distributor_id: "69afaf5df584472a73e89b77" ,variant_id: "69b4d90a5cba88ad9b64ff14", quantity: 500 },

    ]);

    console.log("Stocks Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedStocks();