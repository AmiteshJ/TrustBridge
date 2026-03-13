/**
 * Credential Model
 * Core data structure representing a verifiable credential
 */
const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const credentialSchema = new mongoose.Schema(
  {
    credentialId: {
      type: String,
      unique: true,
      default: () => `TB-${uuidv4().replace(/-/g, "").slice(0, 12).toUpperCase()}`,
    },

    // Ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Credential details
    title: {
      type: String,
      required: [true, "Credential title is required"],
      trim: true,
    },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["education", "employment", "certification", "identity", "finance", "training", "other"],
      default: "other",
    },

    // File storage
    documentUrl: { type: String, required: true },
    documentPublicId: { type: String, default: "" }, // Cloudinary public ID
    thumbnailUrl: { type: String, default: "" },

    // Status lifecycle
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "revoked"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    revocationReason: { type: String, default: "" },

    // Dates
    issuedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },

    // Fraud detection – cryptographic hash of the document
    documentHash: { type: String, default: "" },
    hashAlgorithm: { type: String, default: "sha256" },

    // Trust & scoring
    trustScore: { type: Number, default: 0, min: 0, max: 100 },

    // QR code
    qrCodeUrl: { type: String, default: "" },
    verificationUrl: { type: String, default: "" },

    // DigiLocker
    syncedToDigiLocker: { type: Boolean, default: false },
    digiLockerSyncedAt: { type: Date, default: null },

    // AI analysis result
    aiAnalysis: {
      analyzed: { type: Boolean, default: false },
      issues: [{ type: String }],
      summary: { type: String, default: "" },
      analyzedAt: { type: Date, default: null },
    },

    // Issuer notes
    issuerNotes: { type: String, default: "" },

    // Metadata from document
    metadata: {
      institution: { type: String, default: "" },
      courseOrPosition: { type: String, default: "" },
      grade: { type: String, default: "" },
      completionDate: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
credentialSchema.index({ owner: 1, status: 1 });
credentialSchema.index({ credentialId: 1 });
credentialSchema.index({ issuer: 1, status: 1 });

// ─── Static: generate document hash ──────────────────────────────────────────
credentialSchema.statics.generateHash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// ─── Virtual: isExpired ───────────────────────────────────────────────────────
credentialSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

module.exports = mongoose.model("Credential", credentialSchema);
