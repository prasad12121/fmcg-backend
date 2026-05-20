import mongoose from "mongoose";
mongoose.set("debug", (collectionName, method, query, doc) => {
  console.log(`MongoDB ${collectionName}.${method}`);
  console.log("Query:", JSON.stringify(query));
  console.log("Doc:", JSON.stringify(doc));
});

export default mongoose;