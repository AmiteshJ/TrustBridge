const express = require("express");
const router = express.Router();
const {
  getLiveActivity, getDashboardStats, getCategoryTrends, getTopIssuers, getActivityTimeline, getFraudAlerts
} = require("../controllers/radarController");

// Radar is publicly viewable (no auth required for demo)
router.get("/activity", getLiveActivity);
router.get("/stats", getDashboardStats);
router.get("/trends", getCategoryTrends);
router.get("/issuers", getTopIssuers);
router.get("/timeline", getActivityTimeline);
router.get("/fraud-alerts", getFraudAlerts);

module.exports = router;
