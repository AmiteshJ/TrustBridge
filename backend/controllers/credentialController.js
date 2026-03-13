/**
 * Credential Controller
 * Upload, wallet management, QR code generation, fraud detection
 */
const crypto = require("crypto");
const QRCode = require("qrcode");
const Credential = require("../models/Credential");
const { VerificationLog } = require("../models/Logs");
const { logActivity } = require("../services/activityService");
const { calculateTrustScore } = require("../utils/trustScore");

// ─── Upload Credential Request ────────────────────────────────────────────────
exports.uploadCredential = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Document file is required" });
    }

    const { title, description, category, institution, courseOrPosition, grade, completionDate } = req.body;

    // Generate document hash from URL for fraud detection
    const documentHash = crypto
      .createHash("sha256")
      .update(req.file.path + req.file.originalname + Date.now())
      .digest("hex");

    const credential = await Credential.create({
      owner: req.user._id,
      title,
      description,
      category: category || "other",
      documentUrl: req.file.path,
      documentPublicId: req.file.filename,
      documentHash,
      metadata: { institution, courseOrPosition, grade, completionDate },
    });

    // Generate verification URL + QR code
    const verificationUrl = `${process.env.CLIENT_URL}/verify/${credential.credentialId}`;
    const qrCodeUrl = await QRCode.toDataURL(verificationUrl);

    credential.verificationUrl = verificationUrl;
    credential.qrCodeUrl = qrCodeUrl;
    await credential.save();

    await logActivity(req.app, {
      activityType: "credential_requested",
      userId: req.user._id,
      credentialId: credential._id,
      credentialPublicId: credential.credentialId,
      actorName: req.user.name,
      credentialTitle: title,
      category: category || "other",
    });

    return res.status(201).json({
      success: true,
      message: "Credential submitted for verification",
      credential,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get User's Credential Wallet ─────────────────────────────────────────────
exports.getWallet = async (req, res) => {
  try {
    const credentials = await Credential.find({ owner: req.user._id })
      .populate("issuer", "name organization issuerProfile")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, credentials });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get single credential ────────────────────────────────────────────────────
exports.getCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id)
      .populate("owner", "name email")
      .populate("issuer", "name organization issuerProfile");

    if (!credential) {
      return res.status(404).json({ success: false, message: "Credential not found" });
    }

    // Ensure only owner can fetch their own credential details
    if (
      credential.owner._id.toString() !== req.user._id.toString() &&
      req.user.role !== "issuer" &&
      req.user.role !== "verifier"
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, credential });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Public Verify by Credential ID ──────────────────────────────────────────
exports.verifyCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findOne({ credentialId })
      .populate("owner", "name email")
      .populate("issuer", "name organization issuerProfile");

    if (!credential) {
      return res.status(404).json({
        success: false,
        result: "not_found",
        message: "No credential found with this ID",
      });
    }

    let result = "valid";
    let fraudDetected = false;

    if (credential.status === "revoked") result = "revoked";
    else if (credential.status === "rejected") result = "invalid";
    else if (credential.status !== "verified") result = "invalid";
    else if (credential.isExpired) result = "expired";

    // Log verification
    await VerificationLog.create({
      credential: credential._id,
      credentialId: credential.credentialId,
      verifier: req.user?._id || null,
      verifierName: req.user?.name || "Anonymous",
      verifierOrg: req.user?.organization || "",
      verificationMethod: req.query.method || "id",
      result,
      fraudDetected,
      ipAddress: req.ip,
    });

    if (result === "valid") {
      await logActivity(req.app, {
        activityType: "credential_verified",
        userId: req.user?._id,
        issuerId: credential.issuer?._id,
        credentialId: credential._id,
        credentialPublicId: credential.credentialId,
        actorName: req.user?.name || "Anonymous",
        issuerName: credential.issuer?.name || "",
        credentialTitle: credential.title,
        category: credential.category,
      });
    }

    return res.status(200).json({
      success: true,
      result,
      fraudDetected,
      credential: {
        credentialId: credential.credentialId,
        title: credential.title,
        category: credential.category,
        status: credential.status,
        trustScore: credential.trustScore,
        issuedAt: credential.issuedAt,
        expiresAt: credential.expiresAt,
        issuer: credential.issuer
          ? {
              name: credential.issuer.name,
              organization: credential.issuer.organization,
              trustLevel: credential.issuer.issuerTrustLabel,
              reputationScore: credential.issuer.issuerProfile?.reputationScore,
            }
          : null,
        owner: {
          name: credential.owner.name,
        },
        metadata: credential.metadata,
        verificationUrl: credential.verificationUrl,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Verification History for a credential ────────────────────────────────
exports.getVerificationHistory = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential || credential.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const logs = await VerificationLog.find({ credential: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
