/**
 * Main server entry point for the application.
 * - Connects to MongoDB.
 * - Configures Express with CORS, JSON parsing, cookie parsing, and API routing.
 * - Sets up HTTP server and Socket.io for real-time chat.
 * - Handles allowed origins for both HTTP and WebSocket connections.
 * - Starts the server on the configured port.
 *
 * @module server
 */

import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { corsOptions, socketCorsOptions } from "./config/cors.js";
import router from "./routes/index.js";
import handleSocket from "./sockets/chat.socket.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handler.middleware.js";
import socketAuth from "./middlewares/socket-auth.middleware.js";
import { sanitizeInput, mongoSanitizeMiddleware } from "./middlewares/sanitize.middleware.js";
import { apiLimiter } from "./middlewares/rate-limit.middleware.js";
import AppError from "./utils/app-error.utils.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: socketCorsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Apply input sanitization globally - BEFORE routes
app.use(sanitizeInput);
app.use(mongoSanitizeMiddleware);

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);
app.use("/api", router);

// Apply socket authentication middleware
io.use(socketAuth);

handleSocket(io);

const PORT = process.env.PORT || 4000;

/**
 * Welcome endpoint for Pharma Connect API.
 * @route GET /
 * @desc Returns a welcome message for Pharma Connect.
 */
app.get("/", (req, res) => {
  console.log("GET /");
  res.send("Welcome to the Chat API");
});

// Global error-handling middleware (must be the last app.use)
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
}

export { app, server };
