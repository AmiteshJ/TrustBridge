/**
 * Email Service
 * Handles OTP, verification emails, and notifications
 */
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Send OTP Email ───────────────────────────────────────────────────────────
exports.sendOTPEmail = async (to, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "TrustBridge <noreply@trustbridge.io>",
    to,
    subject: "🔐 TrustBridge – Your Login OTP",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0fdf4; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">🌉 TrustBridge</h1>
          <p style="color: #d1fae5; margin: 8px 0 0;">Universal Credential Verification Platform</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #064e3b; margin-top: 0;">Hello, ${name}!</h2>
          <p style="color: #374151; font-size: 16px;">Your One-Time Password for login is:</p>
          <div style="background: white; border: 2px solid #10b981; border-radius: 12px; text-align: center; padding: 24px; margin: 20px 0;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #059669;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">⏱️ This OTP expires in <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">🔒 Never share this OTP with anyone. TrustBridge will never ask for your OTP.</p>
        </div>
        <div style="background: #ecfdf5; padding: 20px 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TrustBridge. Securing credentials, building trust.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Send Credential Status Email ─────────────────────────────────────────────
exports.sendCredentialStatusEmail = async (to, name, credentialTitle, status, reason = "") => {
  const transporter = createTransporter();

  const statusConfig = {
    verified: { emoji: "✅", color: "#059669", label: "Verified" },
    rejected: { emoji: "❌", color: "#dc2626", label: "Rejected" },
    revoked: { emoji: "🚫", color: "#d97706", label: "Revoked" },
  };

  const cfg = statusConfig[status] || { emoji: "📋", color: "#6b7280", label: status };

  const mailOptions = {
    from: process.env.EMAIL_FROM || "TrustBridge <noreply@trustbridge.io>",
    to,
    subject: `${cfg.emoji} TrustBridge – Credential "${credentialTitle}" ${cfg.label}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0fdf4; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">🌉 TrustBridge</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #064e3b; margin-top: 0;">Hello, ${name}!</h2>
          <p style="color: #374151; font-size: 16px;">Your credential <strong>"${credentialTitle}"</strong> has been updated:</p>
          <div style="background: white; border-left: 4px solid ${cfg.color}; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${cfg.color};">${cfg.emoji} ${cfg.label}</p>
            ${reason ? `<p style="margin: 8px 0 0; color: #6b7280;">Reason: ${reason}</p>` : ""}
          </div>
          <p style="color: #6b7280; font-size: 14px;">Log in to your TrustBridge wallet to view details.</p>
        </div>
        <div style="background: #ecfdf5; padding: 20px 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TrustBridge</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Send DigiLocker OTP ──────────────────────────────────────────────────────
exports.sendDigiLockerOTP = async (to, otp, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "TrustBridge <noreply@trustbridge.io>",
    to,
    subject: "📱 DigiLocker Simulation – Phone Verification OTP",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0;">📱 DigiLocker Simulation</h1>
        </div>
        <div style="padding: 30px; background: #eff6ff; border-radius: 0 0 16px 16px;">
          <p style="color: #1e40af;">Hello <strong>${name}</strong>, your DigiLocker verification OTP is:</p>
          <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; text-align: center; padding: 20px; margin: 20px 0;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
