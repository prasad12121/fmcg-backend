import mongoose from "mongoose";
import Area from "../src/models/area.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const areaSeeder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Area.deleteMany();
    await Area.deleteMany();

    await Area.insertMany([
      { name: "hadapsar", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "swarget", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "mgroad", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "varje", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "kothrud", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "mahadevnagar", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "bhosari", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "deccan", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752a", country_id: "69aacdc4ea449edeb21bc466" },
      { name: "mgc", state_id: "69ac1e0f917c97f988e520e5", city_id: "69ac1e3be08a73fbb6ef752b", country_id: "69aacdc4ea449edeb21bc466" }
    ]);

    console.log("Cities Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

areaSeeder();