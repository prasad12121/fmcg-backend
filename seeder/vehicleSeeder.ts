//create a seeder for the vehicle model

import mongoose from "mongoose";
import Vehicle from "../src/models/vehicle.model";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const seedVehicles = async () => {

    try {

        await mongoose.connect(MONGO_URI);

        console.log("MongoDB Connected");
        await Vehicle.deleteMany();
        await Vehicle.insertMany([
            {
                name: "Vehicle 1",
                vehicle_type: "Car",
                vehicle_number: "MH123456",
                vehicle_chassis_number: "1234567890",
                vehicle_fuel_type: "Petrol",
                status: "available",
                driver_id: "69e219d698fbbf31052c350f",
            },
            {
                name: "Vehicle 2",
                vehicle_type: "Car",
                vehicle_number: "MH123457",
                vehicle_chassis_number: "1234567891",
                vehicle_fuel_type: "Petrol",
                status: "available",
                driver_id: "69e219d698fbbf31052c3510",
            },
        ]);

        console.log("Vehicles Seeded Successfully ✅");
        process.exit();
        
    } catch (error) {
        console.error("Seeder Error:", error);
        process.exit(1);
    }

};

seedVehicles();