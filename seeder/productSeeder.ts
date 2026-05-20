import mongoose from "mongoose";
import Product from "../src/models/Productmodel";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedProduct = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Product.deleteMany();

    await Product.insertMany([
      {
        name: "Amul",
        brand_id: "69a7c234ee14c2ec300d57d2",
        category_id: "69afe7fe9c73ddc50e071279",
        description:
          "Amul is a popular Indian dairy brand known for its wide range of dairy products, including milk, butter, cheese, and ice cream. It is one of the largest dairy cooperatives in India and has a strong presence in the market.",
      },
      {
        name: "chocobar",
        brand_id: "69a7c234ee14c2ec300d57d2",
        category_id: "69b00b039c73ddc50e071369",
        description:
          "Nestle is a global food and beverage company known for its wide range of products, including dairy, beverages, and confectionery.",
      },
      {
        name: "nutri choice",
        brand_id: "69a7c234ee14c2ec300d57d4",
        category_id: "69b010499c73ddc50e071376",
        description:
          "Britannia is an Indian food-products corporation known for its bakery products, dairy products, and snacks.",
      },
    ]);

    console.log("Products Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedProduct();
