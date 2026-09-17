import mongoose from "mongoose";

/*
 * Do not allow disconnected MongoDB operations to sit in Mongoose's
 * command buffer. A healthy API should either execute quickly or fail
 * quickly so the frontend can surface/retry a transient infrastructure
 * problem instead of hanging until its HTTP timeout.
 */
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 3000);

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      /*
       * Hot API workload:
       * - keep a warm pool so the first request after an idle period does
       *   not have to wait for new TCP/TLS connections;
       * - allow enough parallel sockets for dashboard/admin bursts;
       * - allow several connections to be established concurrently so a
       *   cold pool does not create tail-latency spikes.
       */
      maxPoolSize: 50,
      minPoolSize: 10,
      maxConnecting: 10,
      maxIdleTimeMS: 60000,
      waitQueueTimeoutMS: 5000,

      /* Connection / server-selection bounds. */
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
      console.warn(
        "⚠️ MongoDB disconnected; API will fail fast until it reconnects."
      );
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
