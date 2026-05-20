//create a seeder for dispatch model

import mongoose from "mongoose";
import Dispatch from "../src/models/dispatch.model";

import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const dispatchSeeder = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected");
        await Dispatch.deleteMany();
        await Dispatch.insertMany([
            {
                order_id: "69df805c72acc2060506da72",
                invoice_id: "69df808172acc2060506da97",
                dispatch_date: new Date(),
                vehicle_number: "MH123456",
                driver_name: "John Doe",
                status: "pending"
            },

            {
                order_id: "69df6b877163edfd6a837a9f",
                invoice_id: "69df794772acc2060506da3d",
                dispatch_date: new Date(),
                vehicle_number: "MH123457",
                driver_name: "John Doe",
                status: "pending"
            }
        ]);

        console.log("Dispatch Seeded Successfully ✅");

        process.exit();

    } catch (error) {

        console.error("Seeder Error:", error);
        process.exit(1);
    }

};

dispatchSeeder();