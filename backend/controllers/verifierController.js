/**
 * Verifier Controller
 * Credential verification, QR, fraud detection
 */
const Credential = require("../models/Credential");
const { VerificationLog } = require("../models/Logs");
const { logActivity } = require("../services/activityService");
const { generateGroqExplanation } = require("../services/groqService");

// ─── Verify by Credential ID ──────────────────────────────────────────────────
exports.verifyById = async (req, res) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) {
      return res.status(400).json({ success: false, message: "Credential ID required" });
    }

    const credential = await Credential.findOne({ credentialId })
      .populate("owner", "name email")
      .populate("issuer", "name organization issuerProfile");

    if (!credential) {
      await VerificationLog.create({
        credential: null,
        credentialId,
        verifier: req.user._id,
        verifierName: req.user.name,
        verifierOrg: req.user.organization || "",
        verificationMethod: "id",
        result: "not_found",
        fraudDetected: false,
      });
      return res.status(404).json({
        success: false,
        result: "not_found",
        message: "No credential found with this ID",
      });
    }

    let result = determineResult(credential);

    // Fraud detection – check if hash matches
    let fraudDetected = false;
    let fraudDetails = "";
    if (req.body.documentHash && credential.documentHash) {
      if (req.body.documentHash !== credential.documentHash) {
        result = "tampered";
        fraudDetected = true;
        fraudDetails = "Document hash mismatch – possible tampering detected";

        await logActivity(req.app, {
          activityType: "fraud_detected",
          userId: credential.owner._id,
          issuerId: credential.issuer?._id,
          credentialId: credential._id,
          credentialPublicId: credential.credentialId,
          actorName: req.user.name,
          credentialTitle: credential.title,
        });
      }
    }

    // Get AI explanation
    let aiExplanation = "";
    try {
      aiExplanation = await generateGroqExplanation(credential, result, fraudDetected);
    } catch (_) {}

    // Log this verification
    await VerificationLog.create({
      credential: credential._id,
      credentialId,
      verifier: req.user._id,
      verifierName: req.user.name,
      verifierOrg: req.user.organization || "",
      verificationMethod: "id",
      result,
      fraudDetected,
      fraudDetails,
      aiExplanation,
      ipAddress: req.ip,
    });

    if (result === "valid") {
      await logActivity(req.app, {
        activityType: "credential_verified",
        userId: credential.owner._id,
        issuerId: credential.issuer?._id,
        credentialId: credential._id,
        credentialPublicId: credential.credentialId,
        actorName: req.user.name,
        issuerName: credential.issuer?.organization || credential.issuer?.name || "",
        credentialTitle: credential.title,
        category: credential.category,
      });
    }

    return res.status(200).json({
      success: true,
      result,
      fraudDetected,
      fraudDetails,
      aiExplanation,
      credential: buildVerificationPayload(credential),
    });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Verification Logs for verifier ───────────────────────────────────────
exports.getVerificationLogs = async (req, res) => {
  try {
    const logs = await VerificationLog.find({ verifier: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("credential", "title category credentialId");

    return res.status(200).json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function determineResult(credential) {
  if (credential.status === "revoked") return "revoked";
  if (credential.status === "rejected" || credential.status === "pending") return "invalid";
  if (credential.status !== "verified") return "invalid";
  if (credential.expiresAt && new Date() > credential.expiresAt) return "expired";
  return "valid";
}

function buildVerificationPayload(credential) {
  return {
    credentialId: credential.credentialId,
    title: credential.title,
    category: credential.category,
    description: credential.description,
    status: credential.status,
    trustScore: credential.trustScore,
    issuedAt: credential.issuedAt,
    expiresAt: credential.expiresAt,
    revokedAt: credential.revokedAt,
    revocationReason: credential.revocationReason,
    issuer: credential.issuer
      ? {
          name: credential.issuer.name,
          organization: credential.issuer.organization,
          trustLevel: credential.issuer.issuerTrustLabel,
          reputationScore: credential.issuer.issuerProfile?.reputationScore,
        }
      : null,
    owner: { name: credential.owner?.name },
    metadata: credential.metadata,
    verificationUrl: credential.verificationUrl,
  };
}
