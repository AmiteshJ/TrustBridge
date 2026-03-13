/**
 * Auth Controller
 * Registration, Login (with optional 2FA OTP), password reset
 */
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const { sendOTPEmail } = require("../services/emailService");
const { logActivity } = require("../services/activityService");

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;

    // Prevent self-assigning admin
    const allowedRoles = ["user", "issuer", "verifier"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      organization: organization || "",
    });

    // Log registration activity
    await logActivity(req.app, {
      activityType: "user_registered",
      userId: user._id,
      actorName: user.name,
      meta: { role: user.role },
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        organization: user.organization,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Login (Step 1) ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated" });
    }

    // If 2FA is enabled, send OTP and return partial state
    if (user.twoFactorEnabled) {
      const otp = user.generateOTP();
      await user.save();
      await sendOTPEmail(user.email, otp, user.name);

      return res.status(200).json({
        success: true,
        requiresOTP: true,
        message: "OTP sent to your email",
        userId: user._id,
      });
    }

    // No 2FA – return token directly
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      requiresOTP: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        organization: user.organization,
        avatar: user.avatar,
        digilockerLinked: user.digilockerLinked,
        issuerProfile: user.issuerProfile,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Verify OTP (Step 2 for 2FA login) ───────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: "userId and otp are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.clearOTP();
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        organization: user.organization,
        avatar: user.avatar,
        digilockerLinked: user.digilockerLinked,
        issuerProfile: user.issuerProfile,
      },
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = user.generateOTP();
    await user.save();
    await sendOTPEmail(user.email, otp, user.name);

    return res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Toggle 2FA ───────────────────────────────────────────────────────────────
exports.toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `2FA ${user.twoFactorEnabled ? "enabled" : "disabled"} successfully`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
};
