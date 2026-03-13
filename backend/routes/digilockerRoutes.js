const express = require("express");
const router = express.Router();
const {
  initiateLink, verifyAndLink, syncCredential, getVault, unlinkDigiLocker
} = require("../controllers/digilockerController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("user"));
router.post("/initiate", initiateLink);
router.post("/verify", verifyAndLink);
router.post("/sync/:credentialId", syncCredential);
router.get("/vault", getVault);
router.post("/unlink", unlinkDigiLocker);

module.exports = router;
