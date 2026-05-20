import mongoose from "mongoose";
import Distributor from "../src/models/distributor.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const distributorSeeder = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Distributor.deleteMany();

    await Distributor.insertMany([
      {
     country_id: "69aacdc4ea449edeb21bc466",
        state_id: "69aacff60fbb509e87b4d0cf",
        city_id: "69ac1e3be08a73fbb6ef752a",
        area_id: "69ac20e6878c1765a31850fe",
        subarea_id: "69abb86aee96388a086454f6",

        name: "Pune FMCG Distributor",
        contact_person: "Rahul Patil",
        mobile_number1: "9876543210",
        mobile_number2: "9123456780",
        landline_number: "02024567890",

        email: "pune.distributor12@example.com",
        username: "prasad1gfgfg2",
        password: "1234567",

        owner_name: "Rahul Patil",

        address: "Shivaji Nagar, Pune",
        note: "Main distributor for Pune region",

        pan_number: "ABCDE1234F",
        gst_number: "27ABCDE1234F1Z5",
        FSSAI_number: "12345678901234",

        creadit_limit: 500000,
        status: "active",
      },

      {
    country_id: "69aacdc4ea449edeb21bc466",
        state_id: "69aacff60fbb509e87b4d0cf",
        city_id: "69ac1e3be08a73fbb6ef752a",
        area_id: "69ac20e6878c1765a31850fe",
        subarea_id: "69abb86aee96388a086454f6",

        name: "Mumbai FMCG Distributor23",
        contact_person: "Amit Sharma",
        mobile_number1: "9898989898",
        mobile_number2: "9871234567",
        landline_number: "02223456789",

        email: "mumbai.distributor@example.com",
        username: "dfdfd",
        password: "1234567",

        owner_name: "Amit Sharma",

        address: "Andheri East, Mumbai",
        note: "Distributor for Mumbai zone",

        pan_number: "PQRSX1234Z",
        gst_number: "27PQRSX1234Z1Z2",
        FSSAI_number: "98765432109876",

        creadit_limit: 700000,
        status: "active",
      },


        {
        country_id: "69aacdc4ea449edeb21bc466",
        state_id: "69aacff60fbb509e87b4d0cf",
        city_id: "69ac1e3be08a73fbb6ef752a",
        area_id: "69ac20e6878c1765a31850fe",
        subarea_id: "69abb86aee96388a086454f6",

        name: "Pune Retailer",
        contact_person: "Amit Sharma",
        mobile_number1: "9898989898",
        mobile_number2: "9871234567",
        landline_number: "02223456789",

        email: "pune.retailer@example.com",
        username: "prasad123",
        password: "1234567",

        owner_name: "Amit Sharma",

        address: "Andheri East, Mumbai",
        note: "Distributor for Mumbai zone",

        pan_number: "PQRSX1234Z",
        gst_number: "27PQRSX1234Z1Z2",
        FSSAI_number: "98765432109876",

        creadit_limit: 700000,
        status: "active",
        
      },

        {
        country_id: "69aacdc4ea449edeb21bc466",
        state_id: "69aacff60fbb509e87b4d0cf",
        city_id: "69ac1e3be08a73fbb6ef752a",
        area_id: "69ac20e6878c1765a31850fe",
        subarea_id: "69abb86aee96388a086454f6",

        name: "Mumbai FMCG Distributor232323",
        contact_person: "Amit Sharma",
        mobile_number1: "9898989898",
        mobile_number2: "9871234567",
        landline_number: "02223456789",

        email: "mumbai.distributor1@example.com",
        username: "33prasad123",
        password: "1234567",

        owner_name: "Amit Sharma",

        address: "Andheri East, Mumbai",
        note: "Distributor for Mumbai zone",

        pan_number: "PQRSX1234Z",
        gst_number: "27PQRSX1234Z1Z2",
        FSSAI_number: "98765432109876",

        creadit_limit: 700000,
        status: "active",
      }



    ]);

    console.log("Distributors Seeded Successfully ✅");

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

distributorSeeder();