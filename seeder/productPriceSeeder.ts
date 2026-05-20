import mongoose from "mongoose";
import productPriceModel from "../src/models/productPrice.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedProductPrices = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await productPriceModel.deleteMany();

    await productPriceModel.insertMany([
      { variant_id: "69b3a37533b3d7b130c5a18c",mrp: 25, distributor_price:21,retailer_price: 23 },
      { variant_id: "69b4d90a5cba88ad9b64ff13",mrp: 100, distributor_price:80,retailer_price: 95 },
      { variant_id: "69b4d90a5cba88ad9b64ff13",mrp: 300, distributor_price:290,retailer_price: 295 },
    ]);

    console.log("Product Prices Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedProductPrices();