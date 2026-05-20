import mongoose from "mongoose";
import Role from "../src/models/role.module";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const seedRoles = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Role.deleteMany();

    await Role.insertMany([
      {
        name: "admin",
      },

      {
        name: "distributor",
      },

       {
        name: "outlet",
      },
    ]);

    console.log("Roles Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedRoles();
