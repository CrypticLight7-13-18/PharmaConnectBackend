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
import router from "./routes/index.js";
import handleSocket from "./sockets/chat.socket.js";
import cookieParser from "cookie-parser";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://fantastic-goggles-57g4pxpqqjjhv47g-5173.app.github.dev",
  "https://pharmaproject.netlify.app",
  "http://localhost:5173",
  "https://reimagined-barnacle-9g5w9p956x6276g9-5173.app.github.dev",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

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

// Start the HTTP and WebSocket server
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
