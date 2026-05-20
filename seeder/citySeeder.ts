import mongoose from "mongoose";
import City from "../src/models/city.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const citySeeder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await City.deleteMany();

    await City.deleteMany();

    await City.insertMany([
      { name: "Mumbai", state_id: "69ac1e0f917c97f988e520e5" },
      { name: "Pune", state_id: "69ac1e0f917c97f988e520e5" },
      { name: "Nagpur", state_id: "69ac1e0f917c97f988e520e5" },
      { name: "Nashik", state_id: "69ac1e0f917c97f988e520e5" },
      { name: "Ahmedabad", state_id: "69aacff60fbb509e87b4d0d0" },
      { name: "Jaipur", state_id: "69aacff60fbb509e87b4d0d1" },
      { name: "Bhopal", state_id: "69aacff60fbb509e87b4d0d2" },
      { name: "Bengaluru", state_id: "69aacff60fbb509e87b4d0d3" }
    ]);

    console.log("Cities Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

citySeeder();