import mongoose from "mongoose";
import State from "../src/models/state.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const stateSeeder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await State.deleteMany();

    await State.insertMany([
      { name: "Maharashtra", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "Gujarat", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "Rajasthan", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "Madhya Pradesh", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "Karnataka", country_id: "69aacdc4ea449edeb21bc466" },
       { name: "California", country_id: "69aacdc4ea449edeb21bc467" },
    ]);

    console.log("States Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

stateSeeder();