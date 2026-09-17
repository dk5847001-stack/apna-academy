import mongoose from "mongoose";

/*
 * Never let a request sit in Mongoose's command buffer while MongoDB
 * is unavailable. The API should fail fast and let the client retry
 * transient service failures instead of producing long client-side waits.
 */
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 5000);

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 30,
      minPoolSize: 2,
      maxConnecting: 4,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      family: 4,
    });

    connection.connection.on("connected", () => {
      console.log("🍃 MongoDB connection ready.");
    });

    connection.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected; API will fail fast until it reconnects.");
    });

    connection.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error.message);
    });

    console.log(`🍃 MongoDB Connected: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};
