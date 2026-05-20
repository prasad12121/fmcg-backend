import mongoose from "mongoose";
import Brand from "../src/models/variant.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedVariants = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Brand.deleteMany();

    await Brand.insertMany([
      { product_id: "69b25414a6f2a34eae33d6a0" ,unit_id: "69a681e3a8a1eb4539d932d4", name: "Maggi 70g", sku_code: "MAG70",pack_size: "70g", weight: 70},
      { product_id: "69b25414a6f2a34eae33d6a0" ,unit_id: "69a681e3a8a1eb4539d932d4", name: "Maggi 140g", sku_code: "MAG140", pack_size: "140g", weight: 140},
      { product_id: "69b25414a6f2a34eae33d6a0" ,unit_id: "69a681e3a8a1eb4539d932d4", name: "Maggi 12 pack Box", sku_code: "MAG12BOX",  pack_size: "12 x 70g", weight: 840},
    ]);

    console.log("Variants Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedVariants();