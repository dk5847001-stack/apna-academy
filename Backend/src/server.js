import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { releaseExpiredReservations } from "./services/promoReservation.service.js";

const PORT = process.env.PORT || 5000;

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

    // Reclaim abandoned promo checkout reservations so limited codes do not
    // remain locked forever after a browser close/network interruption.
    const promoReservationCleanup = setInterval(() => {
      releaseExpiredReservations().catch((error) => {
        console.error("❌ Promo reservation cleanup failed:", error.message);
      });
    }, 60_000);
    promoReservationCleanup.unref?.();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 ApnaAcademy Backend running on port ${PORT}`
      );
    });

    // Bound idle/request lifetime so stalled clients cannot hold connections forever.
    server.requestTimeout = Math.max(150_000, Number(process.env.REQUEST_TIMEOUT_MS || 150_000));
    server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 35_000);
    server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 5_000);

    /*
    |--------------------------------------------------------------------------
    | Graceful Shutdown
    |--------------------------------------------------------------------------
    */

    const shutdown = (signal) => {
      console.log(
        `\n${signal} received. Shutting down...`
      );

      clearInterval(promoReservationCleanup);

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