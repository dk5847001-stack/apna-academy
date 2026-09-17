import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/env.js";

const PORT = process.env.PORT || 5000;

/*
 * Lightweight request timing. It does not change request handling; it only
 * makes backend-side latency visible when a request crosses the 1 second
 * threshold. This is especially useful for distinguishing Mongo/network
 * latency from frontend timeout issues.
 */
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    if (durationMs >= 1000) {
      console.warn(
        `🐢 Slow API ${req.method} ${req.originalUrl} → ${res.statusCode} in ${durationMs.toFixed(0)}ms`
      );
    }
  });

  next();
});

const startServer = async () => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Environment
    |--------------------------------------------------------------------------
    */

    validateEnv();

    /*
    |--------------------------------------------------------------------------
    | Connect MongoDB
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Start HTTP Server
    |--------------------------------------------------------------------------
    */

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 ApnaAcademy Backend running on port ${PORT}`
      );
    });

    /*
    |--------------------------------------------------------------------------
    | Graceful Shutdown
    |--------------------------------------------------------------------------
    */

    const shutdown = (signal) => {
      console.log(
        `\n${signal} received. Shutting down...`
      );

      server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();