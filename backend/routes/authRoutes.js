// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login, verifyOTP, resendOTP, toggle2FA, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/toggle-2fa", protect, toggle2FA);
router.get("/me", protect, getMe);

module.exports = router;
