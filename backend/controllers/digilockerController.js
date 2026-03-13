/**
 * DigiLocker Simulation Controller
 * Simulates DigiLocker integration with phone OTP
 */
const User = require("../models/User");
const Credential = require("../models/Credential");
const { DigiLockerVault } = require("../models/Logs");
const { sendDigiLockerOTP } = require("../services/emailService");
const { logActivity } = require("../services/activityService");

// ─── Initiate DigiLocker Link (send OTP) ──────────────────────────────────────
exports.initiateLink = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Phone number required" });

    const user = await User.findById(req.user._id);
    const otp = user.generateOTP();
    user.digilockerPhone = phone;
    await user.save();

    // Send OTP to user's email (simulating phone OTP)
    await sendDigiLockerOTP(user.email, otp, user.name);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your registered email (simulating phone SMS)",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Verify OTP and Link DigiLocker ──────────────────────────────────────────
exports.verifyAndLink = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.verifyOTP(otp)) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.digilockerLinked = true;
    user.clearOTP();
    await user.save();

    // Create or update vault
    await DigiLockerVault.findOneAndUpdate(
      { owner: user._id },
      { owner: user._id, phone: user.digilockerPhone, isLinked: true, linkedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "DigiLocker account linked successfully",
      digilockerLinked: true,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Sync credential to DigiLocker vault ─────────────────────────────────────
exports.syncCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.digilockerLinked) {
      return res.status(400).json({ success: false, message: "DigiLocker not linked" });
    }

    const credential = await Credential.findById(credentialId).populate("issuer", "name organization");
    if (!credential || credential.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Credential not found or access denied" });
    }

    if (credential.status !== "verified") {
      return res.status(400).json({ success: false, message: "Only verified credentials can be synced" });
    }

    let vault = await DigiLockerVault.findOne({ owner: req.user._id });
    if (!vault) {
      vault = await DigiLockerVault.create({ owner: req.user._id, isLinked: true, linkedAt: new Date() });
    }

    // Check if already synced
    const alreadySynced = vault.documents.some(
      (d) => d.credentialId?.toString() === credential._id.toString()
    );

    if (!alreadySynced) {
      vault.documents.push({
        credentialId: credential._id,
        credentialPublicId: credential.credentialId,
        title: credential.title,
        category: credential.category,
        documentUrl: credential.documentUrl,
        issuedBy: credential.issuer?.organization || credential.issuer?.name || "Unknown",
        syncedAt: new Date(),
        status: "verified",
      });
      await vault.save();
    }

    credential.syncedToDigiLocker = true;
    credential.digiLockerSyncedAt = new Date();
    await credential.save();

    await logActivity(req.app, {
      activityType: "digilocker_synced",
      userId: req.user._id,
      credentialId: credential._id,
      credentialPublicId: credential.credentialId,
      actorName: req.user.name,
      credentialTitle: credential.title,
      category: credential.category,
    });

    return res.status(200).json({ success: true, message: "Credential synced to DigiLocker vault" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get DigiLocker Vault ─────────────────────────────────────────────────────
exports.getVault = async (req, res) => {
  try {
    const vault = await DigiLockerVault.findOne({ owner: req.user._id });
    if (!vault || !vault.isLinked) {
      return res.status(200).json({ success: true, linked: false, vault: null });
    }
    return res.status(200).json({ success: true, linked: true, vault });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Unlink DigiLocker ────────────────────────────────────────────────────────
exports.unlinkDigiLocker = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { digilockerLinked: false, digilockerPhone: "" });
    await DigiLockerVault.findOneAndUpdate({ owner: req.user._id }, { isLinked: false });
    return res.status(200).json({ success: true, message: "DigiLocker unlinked" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
