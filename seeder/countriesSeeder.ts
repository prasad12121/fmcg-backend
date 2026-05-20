import mongoose from "mongoose";
import Country from "../src/models/countries.model";

const MONGO_URI = "mongodb://127.0.0.1:27017/fmcg";

const countries = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    await Country.deleteMany();

    await Country.insertMany([
      { name: "India", country_code: "IN", currency_code: "INR"},
      {
        name: "United States",
        country_code: "US",
        currency_code: "USD",
      },
      {
        name: "United Kingdom",
        country_code: "UK",
        currency_code: "GBP",
      },
      {
        name: "Canada",
        country_code: "CA",
        currency_code: "CAD",
      },
      {
        name: "Australia",
        country_code: "AU",
        currency_code: "AUD",
      },
      {
        name: "Germany",
        country_code: "DE",
        currency_code: "EUR",
       
      },
      {
        name: "France",
        country_code: "FR",
        currency_code: "EUR",
        
      },
      { name: "Japan", country_code: "JP", currency_code: "JPY" },
      { name: "China", country_code: "CN", currency_code: "CNY" },
      {
        name: "Brazil",
        country_code: "BR",
        currency_code: "BRL",
      
      },
      {
        name: "Russia",
        country_code: "RU",
        currency_code: "RUB",
      
      },
      {
        name: "South Africa",
        country_code: "ZA",
        currency_code: "ZAR",
      
      },
      {
        name: "Mexico",
        country_code: "MX",
        currency_code: "MXN",
        
      },
      { name: "Italy", country_code: "IT", currency_code: "EUR" },
      { name: "Spain", country_code: "ES", currency_code: "EUR" },
      {
        name: "Netherlands",
        country_code: "NL",
        currency_code: "EUR",
       
      },
      {
        name: "Sweden",
        country_code: "SE",
        currency_code: "SEK",
        
      },
      {
        name: "Switzerland",
        country_code: "CH",
        currency_code: "CHF",
        
      },
      {
        name: "Norway",
        country_code: "NO",
        currency_code: "NOK",
        
      },
      {
        name: "Denmark",
        country_code: "DK",
        currency_code: "DKK",
        
      },
      {
        name: "Finland",
        country_code: "FI",
        currency_code: "EUR",
        
      },
      {
        name: "Belgium",
        country_code: "BE",
        currency_code: "EUR",
        
      },
      {
        name: "Austria",
        country_code: "AT",
        currency_code: "EUR",
        
      },
      {
        name: "Ireland",
        country_code: "IE",
        currency_code: "EUR",
        
      },
      {
        name: "Portugal",
        country_code: "PT",
        currency_code: "EUR",
        
      },
      {
        name: "Greece",
        country_code: "GR",
        currency_code: "EUR",
        
      },
      {
        name: "Poland",
        country_code: "PL",
        currency_code: "PLN",
        
      },
    ]);

    console.log("Countries Seeded Successfully ✅");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

countries();
