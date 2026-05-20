import mongoose from "mongoose";
import Beat from "../src/models/beat.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const beatSeeder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Beat.deleteMany();
    await Beat.deleteMany();

    await Beat.insertMany([
      { name: "hadapsar", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69ab196d8827eb51d7ad20aa", subarea_id: "69abb86aee96388a086454f5" },
      { name: "swarget", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f6" },
      { name: "mgroad", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f5" },
      { name: "varje", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f5" },
      { name: "kothrud", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f5" },
      { name: "mahadevnagar", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f5" },
      { name: "bhosari", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f5" },
      { name: "deccan", start_point: "null", end_point: "null", country_id: "69aacdc4ea449edeb21bc466", state_id: "69aacff60fbb509e87b4d0cf", city_id: "69aad34d60a820703835f66a",area_id: "69aad3a560a820703835f66b", subarea_id: "69abb86aee96388a086454f5" }
    ]);

    console.log("Beats Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

beatSeeder();