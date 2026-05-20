import mongoose from "mongoose";


/*
mongoose.set("debug", (collectionName, method, query, doc) => {
  console.log(`MongoDB ${collectionName}.${method}`);
  console.log("Query:", JSON.stringify(query));
  console.log("Doc:", JSON.stringify(doc));
});
*/
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected here");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};