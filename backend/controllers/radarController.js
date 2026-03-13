/**
 * Radar Controller
 * Live Credential Radar dashboard data
 */
const { ActivityLog } = require("../models/Logs");
const Credential = require("../models/Credential");
const User = require("../models/User");
const { VerificationLog } = require("../models/Logs");

// ─── Get Live Activity Feed ───────────────────────────────────────────────────
exports.getLiveActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ success: true, activities });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Dashboard Stats ──────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalCredentials,
      verifiedCredentials,
      pendingCredentials,
      revokedCredentials,
      totalUsers,
      totalIssuers,
      totalVerifiers,
      totalVerifications,
      fraudCount,
    ] = await Promise.all([
      Credential.countDocuments(),
      Credential.countDocuments({ status: "verified" }),
      Credential.countDocuments({ status: "pending" }),
      Credential.countDocuments({ status: "revoked" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "issuer" }),
      User.countDocuments({ role: "verifier" }),
      VerificationLog.countDocuments(),
      ActivityLog.countDocuments({ activityType: "fraud_detected" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCredentials,
        verifiedCredentials,
        pendingCredentials,
        revokedCredentials,
        totalUsers,
        totalIssuers,
        totalVerifiers,
        totalVerifications,
        fraudCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Category Trends ──────────────────────────────────────────────────────
exports.getCategoryTrends = async (req, res) => {
  try {
    const trends = await Credential.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return res.status(200).json({ success: true, trends });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Top Issuers ──────────────────────────────────────────────────────────
exports.getTopIssuers = async (req, res) => {
  try {
    const issuers = await User.find({ role: "issuer" })
      .select("name organization issuerProfile")
      .sort({ "issuerProfile.reputationScore": -1 })
      .limit(10);

    return res.status(200).json({ success: true, issuers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Activity Over Time (last 7 days) ─────────────────────────────────────
exports.getActivityTimeline = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const timeline = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$activityType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    return res.status(200).json({ success: true, timeline });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Fraud Alerts ─────────────────────────────────────────────────────────
exports.getFraudAlerts = async (req, res) => {
  try {
    const alerts = await VerificationLog.find({ fraudDetected: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("credential", "title credentialId");

    return res.status(200).json({ success: true, alerts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
