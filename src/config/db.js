const mongoose = require("mongoose");


async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in env");

  mongoose.set("strictQuery", true);

  await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: true
  });

  console.log("✅ MongoDB connected");
}

module.exports = connectDB;
