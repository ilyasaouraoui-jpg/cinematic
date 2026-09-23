const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    if (process.env.MONGO_URI && process.env.MONGO_URI !== "memory") {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn.connection;
    }

    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log("In-memory MongoDB connected");
      return mongoose.connection;
    } catch (error) {
      console.log("Memory server not available, trying local MongoDB...");
    }

    await mongoose.connect("mongodb://127.0.0.1:27017/cinematic");
    console.log("Local MongoDB connected");
    return mongoose.connection;
  })().catch((err) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
};

module.exports = connectDB;
