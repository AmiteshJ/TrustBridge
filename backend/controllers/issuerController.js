/**
 * Issuer Controller
 * Manage credential verification queue, approve/reject/revoke
 */
const Credential = require("../models/Credential");
const User = require("../models/User");
const { logActivity } = require("../services/activityService");
const { sendCredentialStatusEmail } = require("../services/emailService");
const { calculateTrustScore, calculateIssuerReputation, getTrustLevel } = require("../utils/trustScore");

// ─── Get Pending Queue ────────────────────────────────────────────────────────
exports.getPendingQueue = async (req, res) => {
  try {
    const credentials = await Credential.find({ status: "pending" })
      .populate("owner", "name email")
      .sort({ createdAt: 1 }); // oldest first

    return res.status(200).json({ success: true, credentials });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Approve Credential ───────────────────────────────────────────────────────
exports.approveCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, expiresAt } = req.body;

    const credential = await Credential.findById(id).populate("owner", "name email");
    if (!credential) {
      return res.status(404).json({ success: false, message: "Credential not found" });
    }
    if (credential.status !== "pending") {
      return res.status(400).json({ success: false, message: "Credential is not in pending state" });
    }

    // Fetch issuer reputation
    const issuer = await User.findById(req.user._id);

    credential.status = "verified";
    credential.issuer = req.user._id;
    credential.issuedAt = new Date();
    credential.expiresAt = expiresAt ? new Date(expiresAt) : null;
    credential.issuerNotes = notes || "";

    // Calculate trust score
    credential.trustScore = calculateTrustScore({
      issuerReputation: issuer.issuerProfile?.reputationScore || 80,
      issuedAt: credential.issuedAt,
      expiresAt: credential.expiresAt,
      isRevoked: false,
      verificationCount: 0,
    });

    await credential.save();

    // Update issuer stats
    issuer.issuerProfile.totalIssued += 1;
    const newRep = calculateIssuerReputation({
      totalIssued: issuer.issuerProfile.totalIssued,
      totalRevoked: issuer.issuerProfile.totalRevoked,
      verifiedCount: issuer.issuerProfile.verifiedCount,
    });
    issuer.issuerProfile.reputationScore = newRep;
    issuer.issuerProfile.trustLevel = getTrustLevel(newRep);
    await issuer.save();

    // Notify user
    await sendCredentialStatusEmail(
      credential.owner.email,
      credential.owner.name,
      credential.title,
      "verified"
    );

    await logActivity(req.app, {
      activityType: "credential_issued",
      userId: credential.owner._id,
      issuerId: req.user._id,
      credentialId: credential._id,
      credentialPublicId: credential.credentialId,
      actorName: req.user.name,
      issuerName: issuer.organization || issuer.name,
      credentialTitle: credential.title,
      category: credential.category,
    });

    return res.status(200).json({
      success: true,
      message: "Credential approved and issued",
      credential,
    });
  } catch (err) {
    console.error("Approve error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Reject Credential ────────────────────────────────────────────────────────
exports.rejectCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const credential = await Credential.findById(id).populate("owner", "name email");
    if (!credential || credential.status !== "pending") {
      return res.status(400).json({ success: false, message: "Credential not found or not pending" });
    }

    credential.status = "rejected";
    credential.rejectionReason = reason || "Does not meet verification criteria";
    credential.issuer = req.user._id;
    await credential.save();

    await sendCredentialStatusEmail(
      credential.owner.email,
      credential.owner.name,
      credential.title,
      "rejected",
      credential.rejectionReason
    );

    return res.status(200).json({ success: true, message: "Credential rejected", credential });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Revoke Credential ────────────────────────────────────────────────────────
exports.revokeCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const credential = await Credential.findById(id).populate("owner", "name email");
    if (!credential || credential.status !== "verified") {
      return res.status(400).json({ success: false, message: "Credential is not verified or not found" });
    }

    // Check issuer owns this credential
    if (credential.issuer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to revoke this credential" });
    }

    credential.status = "revoked";
    credential.revocationReason = reason || "Revoked by issuer";
    credential.revokedAt = new Date();
    credential.trustScore = 0;
    await credential.save();

    // Update issuer stats
    const issuer = await User.findById(req.user._id);
    issuer.issuerProfile.totalRevoked += 1;
    const newRep = calculateIssuerReputation({
      totalIssued: issuer.issuerProfile.totalIssued,
      totalRevoked: issuer.issuerProfile.totalRevoked,
      verifiedCount: issuer.issuerProfile.verifiedCount,
    });
    issuer.issuerProfile.reputationScore = newRep;
    issuer.issuerProfile.trustLevel = getTrustLevel(newRep);
    await issuer.save();

    await sendCredentialStatusEmail(
      credential.owner.email,
      credential.owner.name,
      credential.title,
      "revoked",
      credential.revocationReason
    );

    await logActivity(req.app, {
      activityType: "credential_revoked",
      issuerId: req.user._id,
      credentialId: credential._id,
      credentialPublicId: credential.credentialId,
      actorName: req.user.name,
      issuerName: req.user.organization || req.user.name,
      credentialTitle: credential.title,
      category: credential.category,
    });

    return res.status(200).json({ success: true, message: "Credential revoked", credential });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Issued History ───────────────────────────────────────────────────────
exports.getIssuedHistory = async (req, res) => {
  try {
    const credentials = await Credential.find({
      issuer: req.user._id,
      status: { $in: ["verified", "revoked"] },
    })
      .populate("owner", "name email")
      .sort({ issuedAt: -1 });

    return res.status(200).json({ success: true, credentials });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Issuer Stats ─────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const issuer = await User.findById(req.user._id);
    const pending = await Credential.countDocuments({ status: "pending" });
    const issued = await Credential.countDocuments({ issuer: req.user._id, status: "verified" });
    const revoked = await Credential.countDocuments({ issuer: req.user._id, status: "revoked" });

    return res.status(200).json({
      success: true,
      stats: {
        pending,
        issued,
        revoked,
        reputationScore: issuer.issuerProfile?.reputationScore,
        trustLevel: issuer.issuerProfile?.trustLevel,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
