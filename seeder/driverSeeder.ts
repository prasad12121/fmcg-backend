//create a seeder for the driver model

import mongoose from "mongoose";
import Driver from "../src/models/driver.model";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seedDrivers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");

        await Driver.deleteMany();

        await Driver.insertMany([
            {
                name: "Driver 1",
                mobile: "9876543210",
                license_number: "MH123456",
            },
            {
                name: "Driver 2",
                mobile: "9876543211",
                license_number: "MH123457",
            },
            {
                name: "Driver 3",
                mobile: "9876543212",
                license_number: "MH123458",
            },
            {
                name: "Driver 4",
                mobile: "9876543213",
                license_number: "MH123459",
            },
            {
                name: "Driver 5",
                mobile: "9876543214",
                license_number: "MH123460",
            }
        ]);

        console.log("Drivers Seeded Successfully ✅");
        process.exit();
    } catch (error) {
        console.error("Seeder Error:", error);
        process.exit(1);
    }
}


seedDrivers();