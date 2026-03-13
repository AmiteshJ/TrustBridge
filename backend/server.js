/**
 * TrustBridge - Universal Credential Verification Platform
 * Main Server Entry Point
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const { initSocketHandlers } = require("./services/socketService");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const credentialRoutes = require("./routes/credentialRoutes");
const issuerRoutes = require("./routes/issuerRoutes");
const verifierRoutes = require("./routes/verifierRoutes");
const digilockerRoutes = require("./routes/digilockerRoutes");
const aiRoutes = require("./routes/aiRoutes");
const radarRoutes = require("./routes/radarRoutes");

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Make io accessible globally via app
app.set("io", io);

// Connect to MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Rate limiter – global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

// Stricter limiter for auth
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 20,
  message: { success: false, message: "Too many auth attempts, please wait." },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/verifier", verifierRoutes);
app.use("/api/digilocker", digilockerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/radar", radarRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "TrustBridge API is running", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocketHandlers(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🌉 TrustBridge Backend running on port ${PORT}`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.io enabled\n`);
});

module.exports = { app, server };
