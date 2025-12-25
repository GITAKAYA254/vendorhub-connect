// Express application setup and middleware configuration
import express from "express";
import cors from "cors"; // Cross-Origin Resource Sharing
import morgan from "morgan"; // request logging
import cookieParser from "cookie-parser"; // cookie parsing
import routes from "./routes/index.js"; // application routes
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js"; // error handlers
import { successResponse } from "./utils/response.js"; // standardized response shape

const app = express();

// Determine allowed CORS origins. `CLIENT_ORIGIN` may be a comma-separated list.
// If not provided, default to the local Vite dev server origin.
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

// Enable CORS for the configured origins and allow credentials (cookies)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Parse cookies on incoming requests (populates `req.cookies`)
app.use(cookieParser());

// HTTP request logger useful during development
app.use(morgan("dev"));

// Simple health check used by monitors or to verify the server process
app.get("/health", (req, res) => {
  res.json(successResponse({ status: "ok" }));
});

// Mount the main API router under `/api`.
// All application endpoints are defined in the routers imported by `routes`.
app.use("/api", routes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler (must be last middleware)
app.use(errorHandler);

export default app;
