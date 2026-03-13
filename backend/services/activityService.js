/**
 * Activity Logging Service
 * Logs ecosystem events and broadcasts via Socket.io
 */
const { ActivityLog } = require("../models/Logs");

/**
 * Log an activity and emit it via Socket.io
 */
exports.logActivity = async (app, data) => {
  try {
    const log = await ActivityLog.create(data);

    // Broadcast to all connected clients via Socket.io
    const io = app?.get("io");
    if (io) {
      io.emit("activity:new", {
        _id: log._id,
        activityType: log.activityType,
        actorName: log.actorName,
        issuerName: log.issuerName,
        credentialTitle: log.credentialTitle,
        category: log.category,
        location: log.location,
        createdAt: log.createdAt,
      });
    }

    return log;
  } catch (err) {
    console.error("ActivityLog error:", err.message);
  }
};
