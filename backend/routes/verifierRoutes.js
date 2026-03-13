// ─── verifierRoutes.js ────────────────────────────────────────────────────────
const express = require("express");
const verifierRouter = express.Router();
const { verifyById, getVerificationLogs } = require("../controllers/verifierController");
const { protect, authorize } = require("../middleware/auth");

verifierRouter.post("/verify", protect, authorize("verifier"), verifyById);
verifierRouter.get("/logs", protect, authorize("verifier"), getVerificationLogs);

module.exports = verifierRouter;
