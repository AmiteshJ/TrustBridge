// ─── aiRoutes.js ──────────────────────────────────────────────────────────────
const express = require("express");
const aiRouter = express.Router();
const { chat, analyzeCredential } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

aiRouter.post("/chat", protect, chat);
aiRouter.post("/analyze", protect, analyzeCredential);

module.exports = aiRouter;

// ─── radarRoutes.js ───────────────────────────────────────────────────────────
// (saved separately below)
