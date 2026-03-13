/**
 * User Model
 * Supports three roles: user, issuer, verifier
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never return password in queries
    },
    role: {
      type: String,
      enum: ["user", "issuer", "verifier"],
      default: "user",
    },

    // Profile
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    organization: { type: String, default: "" }, // for issuers/verifiers

    // Issuer-specific fields
    issuerProfile: {
      category: {
        type: String,
        enum: ["university", "certification_body", "company", "training_institute", "government", "other"],
        default: "other",
      },
      reputationScore: { type: Number, default: 80, min: 0, max: 100 },
      trustLevel: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium",
      },
      totalIssued: { type: Number, default: 0 },
      totalRevoked: { type: Number, default: 0 },
      verifiedCount: { type: Number, default: 0 },
    },

    // 2FA / OTP
    twoFactorEnabled: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },

    // DigiLocker
    digilockerLinked: { type: Boolean, default: false },
    digilockerPhone: { type: String, default: "" },

    // Account status
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },

    // Password reset
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000);
  return otp;
};

userSchema.methods.verifyOTP = function (enteredOTP) {
  return this.otp === enteredOTP && this.otpExpires > new Date();
};

userSchema.methods.clearOTP = function () {
  this.otp = null;
  this.otpExpires = null;
};

// ─── Virtual: full issuer trust label ─────────────────────────────────────────
userSchema.virtual("issuerTrustLabel").get(function () {
  if (this.role !== "issuer") return null;
  const score = this.issuerProfile?.reputationScore || 0;
  if (score >= 80) return "High Trust";
  if (score >= 50) return "Medium Trust";
  return "Low Trust";
});

module.exports = mongoose.model("User", userSchema);
