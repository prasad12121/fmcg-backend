import mongoose from "mongoose";

import Category from "../src/models/unitCategory.model";
const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";


const seedUnitCategory = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Category.deleteMany();

    await Category.insertMany([
      { name: "Weight" },
      { name: "Volume" },
      { name: "Quantity" }
    ]);

    console.log("Unit Categories Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedUnitCategory();