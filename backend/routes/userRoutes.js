const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// Get profile
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// Update profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, organization } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, organization },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
