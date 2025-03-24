const express = require("express");
const router = express.Router();
const {
  getSpreadLossAnalytics,
} = require("../controllers/analyticsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/spread-loss", authenticateToken, getSpreadLossAnalytics);

module.exports = router;
