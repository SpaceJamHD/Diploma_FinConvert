const express = require("express");
const router = express.Router();
const {
  getSpreadLossAnalytics,
  getGoalsDistributionAnalytics,
  getNextMonthForecast,
} = require("../controllers/analyticsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/spread-loss", authenticateToken, getSpreadLossAnalytics);
router.get(
  "/goals-distribution",
  authenticateToken,
  getGoalsDistributionAnalytics
);

router.get("/forecast", authenticateToken, getNextMonthForecast);

module.exports = router;
