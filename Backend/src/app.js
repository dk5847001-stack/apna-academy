import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { API_PREFIX } from "./constants/index.js";
import apiRoutes from "./routes/index.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Path Configuration
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Production origins are configured through CORS_ALLOWED_ORIGINS.
| Example:
|
| CORS_ALLOWED_ORIGINS=https://example.com,https://dashboard.example.com
|
| CLIENT_URL is retained as a single-origin fallback for deployments
| that only expose one browser application.
|
| Local development keeps the existing localhost ports available.
|--------------------------------------------------------------------------
*/

const defaultLocalOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

const configuredOrigins = [
  ...(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const allowedOrigins = [
  ...new Set([
    ...defaultLocalOrigins,
    ...configuredOrigins,
  ]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header include server-to-server,
      // health-check, and other non-browser requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| Static Certificate Files
|--------------------------------------------------------------------------
|
| Generated certificate PDFs and QR images are stored in:
|
| Backend/public/certificates/
|
| They are exposed through:
|
| http://localhost:5000/certificates/<filename>
|
*/

app.use(
  "/certificates",
  express.static(
    path.resolve(
      __dirname,
      "../public/certificates"
    ),
    {
      fallthrough: false,
      index: false,
      dotfiles: "deny",
      etag: true,
      maxAge: "1h",
    }
  )
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "ApnaAcademy API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(API_PREFIX, apiRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

export default app;