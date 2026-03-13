/**
 * VerificationLog Model
 * Records every verification attempt
 */
const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
  {
    credential: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credential",
      required: true,
    },
    credentialId: { type: String, required: true }, // TB-... ID for quick lookup
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifierName: { type: String, default: "Anonymous" },
    verifierOrg: { type: String, default: "" },
    verificationMethod: {
      type: String,
      enum: ["id", "qr", "link", "api"],
      default: "id",
    },
    result: {
      type: String,
      enum: ["valid", "invalid", "tampered", "expired", "revoked", "not_found"],
      required: true,
    },
    fraudDetected: { type: Boolean, default: false },
    fraudDetails: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    location: { type: String, default: "" },
    // AI explanation
    aiExplanation: { type: String, default: "" },
  },
  { timestamps: true }
);

verificationLogSchema.index({ credentialId: 1 });
verificationLogSchema.index({ verifier: 1 });
verificationLogSchema.index({ createdAt: -1 });

const VerificationLog = mongoose.model("VerificationLog", verificationLogSchema);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ActivityLog Model
 * Ecosystem-wide activity for the Radar dashboard
 */
const activityLogSchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      enum: [
        "credential_requested",
        "credential_issued",
        "credential_verified",
        "credential_revoked",
        "fraud_detected",
        "user_registered",
        "digilocker_synced",
      ],
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    issuerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    credentialId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential", default: null },
    credentialPublicId: { type: String, default: "" },
    actorName: { type: String, default: "System" },
    issuerName: { type: String, default: "" },
    credentialTitle: { type: String, default: "" },
    category: { type: String, default: "other" },
    location: { type: String, default: "India" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ activityType: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DigiLockerVault Model
 */
const digiLockerVaultSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: { type: String, default: "" },
    isLinked: { type: Boolean, default: false },
    linkedAt: { type: Date, default: null },
    documents: [
      {
        credentialId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential" },
        credentialPublicId: { type: String },
        title: { type: String },
        category: { type: String },
        documentUrl: { type: String },
        issuedBy: { type: String },
        syncedAt: { type: Date, default: Date.now },
        status: { type: String, default: "verified" },
      },
    ],
  },
  { timestamps: true }
);

const DigiLockerVault = mongoose.model("DigiLockerVault", digiLockerVaultSchema);

module.exports = { VerificationLog, ActivityLog, DigiLockerVault };
