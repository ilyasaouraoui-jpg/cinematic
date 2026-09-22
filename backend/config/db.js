const mongoose = require("mongoose");

const connectDB = async () => {
  if (process.env.MONGO_URI && process.env.MONGO_URI !== "memory") {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  }

  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`In-memory MongoDB connected`);
    return;
  } catch (error) {
    console.log("Memory server not available, trying local MongoDB...");
  }

  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cinematic");
    console.log("Local MongoDB connected");
  } catch (error) {
    console.error("No database available. Auth will not persist.", error.message);
  }
};

module.exports = connectDB;
