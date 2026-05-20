import mongoose from "mongoose";

import Category from "../src/models/category.model";
const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";


const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Category.deleteMany();

    await Category.insertMany([
      { name: "electronics" },
      { name: "grocery" },
      { name: "clothes" },
      { name: "mobile" },
      { name: "laptop" }
    ]);

    console.log("Categories Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedCategories();