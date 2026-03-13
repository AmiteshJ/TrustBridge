// ─── credentialRoutes.js ──────────────────────────────────────────────────────
const express = require("express");
const credRouter = express.Router();
const {
  uploadCredential, getWallet, getCredential, verifyCredential, getVerificationHistory
} = require("../controllers/credentialController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

credRouter.post("/upload", protect, authorize("user"), upload.single("document"), uploadCredential);
credRouter.get("/wallet", protect, authorize("user"), getWallet);
credRouter.get("/:id", protect, getCredential);
credRouter.get("/verify/:credentialId", verifyCredential); // public
credRouter.get("/:id/verifications", protect, getVerificationHistory);

module.exports = credRouter;
