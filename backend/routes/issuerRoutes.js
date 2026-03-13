const express = require("express");
const router = express.Router();
const {
  getPendingQueue, approveCredential, rejectCredential, revokeCredential, getIssuedHistory, getStats
} = require("../controllers/issuerController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("issuer"));
router.get("/queue", getPendingQueue);
router.get("/history", getIssuedHistory);
router.get("/stats", getStats);
router.put("/approve/:id", approveCredential);
router.put("/reject/:id", rejectCredential);
router.put("/revoke/:id", revokeCredential);

module.exports = router;
