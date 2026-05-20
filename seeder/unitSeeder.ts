import mongoose from "mongoose";

import Unit from "../src/models/unit.model";
const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedUnit = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Unit.deleteMany();

    await Unit.insertMany([
      { category_id: "69a55cb399fe08609a8209fd", name: "kg", symbol: "kg" },
      { category_id: "69a55cb399fe08609a8209fe", name: "ltr", symbol: "L" },
      { category_id: "69a55cb399fe08609a8209fd", name: "gram", symbol: "g" },
      {
        category_id: "69a55cb399fe08609a8209ff",
        name: "quantity",
        symbol: "pcs",
      },
    ]);

    console.log("Units Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedUnit();
