import mongoose from "mongoose";
import SubArea from "../src/models/subArea.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const subAreaSeeder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await SubArea.deleteMany();
    await SubArea.deleteMany();

    await SubArea.insertMany([
      { name: "mahadevnagar ", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69ab196d8827eb51d7ad20aa" },
      { name: "vishrantnagar", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69ab196d8827eb51d7ad20ab" },
    ]);

    console.log("Sub Areas Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

subAreaSeeder();