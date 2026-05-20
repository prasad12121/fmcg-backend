import mongoose from "mongoose";
import Brand from "../src/models/brand.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedBrands = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Brand.deleteMany();

    await Brand.insertMany([
      { name: "Amul" },
      { name: "Nestle" },
      { name: "Britannia" },
      { name: "Parle G" },
      { name: "ITC" }
    ]);

    console.log("Brands Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedBrands();